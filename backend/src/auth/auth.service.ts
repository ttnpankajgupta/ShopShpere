import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpPurpose, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  ACCOUNT_LOCK_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from './auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

export interface PublicUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  mobile: string | null;
  status: UserStatus;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    await this.assertRateLimit(`auth:register:${dto.email}`);

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(dto.mobile ? [{ mobile: dto.mobile }] : []),
        ],
      },
    });

    if (existing?.email === email) {
      if (existing.status === UserStatus.ACTIVE) {
        throw this.httpError(HttpStatus.CONFLICT, 'EMAIL_ALREADY_EXISTS', 'Email is already registered');
      }

      if (dto.mobile && existing.mobile !== dto.mobile) {
        const mobileOwner = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
        if (mobileOwner && mobileOwner.id !== existing.id) {
          throw this.httpError(
            HttpStatus.CONFLICT,
            'MOBILE_ALREADY_EXISTS',
            'Mobile number is already registered',
          );
        }
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          mobile: dto.mobile,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          status: UserStatus.PENDING_VERIFICATION,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await this.invalidatePendingRegistrationOtps(user.email);
      await this.issueOtp(user.email, OtpPurpose.REGISTRATION, user.id);

      return {
        userId: user.id,
        email: user.email,
        status: user.status,
        otpSent: true,
        otpExpiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      };
    }

    if (dto.mobile && existing?.mobile === dto.mobile) {
      throw this.httpError(HttpStatus.CONFLICT, 'MOBILE_ALREADY_EXISTS', 'Mobile number is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        mobile: dto.mobile,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
        status: UserStatus.PENDING_VERIFICATION,
        userRoles: {
          create: {
            role: { connect: { name: 'customer' } },
          },
        },
      },
    });

    await this.issueOtp(user.email, OtpPurpose.REGISTRATION, user.id);

    return {
      userId: user.id,
      email: user.email,
      status: user.status,
      otpSent: true,
      otpExpiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    await this.assertRateLimit(`auth:send-otp:${dto.email}`);

    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (dto.purpose === OtpPurpose.REGISTRATION) {
      if (!user || user.status !== UserStatus.PENDING_VERIFICATION) {
        throw this.httpError(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'No pending registration found for this email');
      }
    } else if (dto.purpose === OtpPurpose.LOGIN) {
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw this.httpError(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'No active account found for OTP login');
      }
    } else if (dto.purpose === OtpPurpose.PASSWORD_RESET) {
      if (!user) {
        return this.genericOtpResponse();
      }
    }

    const cooldownKey = `otp:cooldown:${email}:${dto.purpose}`;
    const cooldown = await this.redis.getClient().ttl(cooldownKey);
    if (cooldown > 0) {
      throw this.httpError(
        HttpStatus.TOO_MANY_REQUESTS,
        'RESEND_COOLDOWN',
        'Please wait before requesting another code',
        [{ resendAvailableInSeconds: cooldown }],
      );
    }

    await this.issueOtp(email, dto.purpose, user?.id);
    return this.genericOtpResponse();
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<SessionPayload> {
    await this.assertRateLimit(`auth:verify-otp:${dto.email}`);
    const email = dto.email.toLowerCase();

    const otp = await this.prisma.otpVerification.findFirst({
      where: {
        email,
        purpose: dto.purpose,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw this.httpError(HttpStatus.BAD_REQUEST, 'OTP_EXPIRED', 'Verification code has expired');
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw this.httpError(HttpStatus.TOO_MANY_REQUESTS, 'OTP_MAX_ATTEMPTS', 'Too many invalid attempts');
    }

    const valid = await bcrypt.compare(dto.code, otp.codeHash);
    if (!valid) {
      await this.prisma.otpVerification.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw this.httpError(HttpStatus.BAD_REQUEST, 'INVALID_OTP', 'Invalid verification code');
    }

    await this.prisma.otpVerification.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw this.httpError(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'Account not found');
    }

    if (dto.purpose === OtpPurpose.REGISTRATION) {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          emailVerifiedAt: new Date(),
        },
      });
      return this.createSession(updated);
    }

    if (dto.purpose === OtpPurpose.LOGIN) {
      if (user.status !== UserStatus.ACTIVE) {
        throw this.httpError(HttpStatus.FORBIDDEN, 'ACCOUNT_NOT_VERIFIED', 'Account is not verified');
      }
      return this.createSession(user);
    }

    throw this.httpError(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'OTP purpose is not valid for session creation');
  }

  async login(dto: LoginDto): Promise<SessionPayload> {
    await this.assertRateLimit(`auth:login:${dto.email}`);
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw this.httpError(HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw this.httpError(HttpStatus.LOCKED, 'ACCOUNT_LOCKED', 'Account is temporarily locked');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw this.httpError(HttpStatus.FORBIDDEN, 'ACCOUNT_NOT_VERIFIED', 'Please verify your account first');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil =
        attempts >= MAX_LOGIN_ATTEMPTS
          ? new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000)
          : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil,
        },
      });

      throw this.httpError(HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    return this.createSession(updated);
  }

  async refresh(dto: RefreshDto) {
    await this.assertRateLimit(`auth:refresh:${this.hashToken(dto.refreshToken).slice(0, 16)}`);
    const tokenHash = this.hashToken(dto.refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw this.httpError(HttpStatus.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = await this.signAccessToken(stored.user);
    const refreshToken = await this.createRefreshToken(stored.user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  async logout(dto: RefreshDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { loggedOut: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    await this.assertRateLimit(`auth:forgot:${dto.email}`);
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      await this.issueOtp(email, OtpPurpose.PASSWORD_RESET, user.id);
    }

    return {
      message: 'If an account exists, a reset code has been sent.',
      otpExpiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.assertRateLimit(`auth:reset:${dto.email}`);
    const email = dto.email.toLowerCase();

    const otp = await this.prisma.otpVerification.findFirst({
      where: {
        email,
        purpose: OtpPurpose.PASSWORD_RESET,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw this.httpError(HttpStatus.BAD_REQUEST, 'OTP_EXPIRED', 'Reset code has expired');
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw this.httpError(HttpStatus.TOO_MANY_REQUESTS, 'OTP_MAX_ATTEMPTS', 'Too many invalid attempts');
    }

    const valid = await bcrypt.compare(dto.code, otp.codeHash);
    if (!valid) {
      await this.prisma.otpVerification.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw this.httpError(HttpStatus.BAD_REQUEST, 'INVALID_OTP', 'Invalid reset code');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw this.httpError(HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', 'Account not found');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      this.prisma.otpVerification.update({
        where: { id: otp.id },
        data: { verifiedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { passwordReset: true };
  }

  async validateAccessToken(token: string): Promise<PublicUser> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('Invalid user');
      }
      return this.toPublicUser(user);
    } catch {
      throw this.httpError(HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid or expired access token');
    }
  }

  private async createSession(user: User): Promise<SessionPayload> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      user: this.toPublicUser(user),
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync({ sub: user.id, email: user.email });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(raw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return raw;
  }

  private async invalidatePendingRegistrationOtps(email: string) {
    await this.prisma.otpVerification.updateMany({
      where: {
        email,
        purpose: OtpPurpose.REGISTRATION,
        verifiedAt: null,
      },
      data: { verifiedAt: new Date() },
    });
  }

  private async issueOtp(email: string, purpose: OtpPurpose, userId?: string) {
    const code = randomInt(0, 10 ** OTP_LENGTH)
      .toString()
      .padStart(OTP_LENGTH, '0');
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: {
        email,
        purpose,
        userId,
        codeHash,
        expiresAt,
      },
    });

    const cooldownKey = `otp:cooldown:${email}:${purpose}`;
    await this.redis.getClient().setex(cooldownKey, OTP_RESEND_COOLDOWN_SECONDS, '1');

    if (process.env.E2E_EXPOSE_OTP === 'true') {
      const e2eKey = `e2e:otp:${email}:${purpose}`;
      await this.redis.getClient().setex(e2eKey, OTP_EXPIRY_MINUTES * 60, code);
    }

    // Dev-only OTP logging for local testing — never log in production
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`OTP issued for ${email} (${purpose})`);
    }
  }

  private genericOtpResponse() {
    return {
      otpSent: true,
      otpExpiresInSeconds: OTP_EXPIRY_MINUTES * 60,
      resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      status: user.status,
    };
  }

  private async assertRateLimit(key: string) {
    const client = this.redis.getClient();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }
    if (count > RATE_LIMIT_MAX_REQUESTS) {
      throw this.httpError(HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMITED', 'Too many requests');
    }
  }

  private httpError(status: number, code: string, message: string, details?: unknown[]) {
    throw new HttpException({ code, message, details }, status);
  }
}
