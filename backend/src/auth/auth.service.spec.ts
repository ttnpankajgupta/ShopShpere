jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    signAsync: jest.fn().mockResolvedValue('access-token'),
    verifyAsync: jest.fn(),
  })),
}));

import { OtpPurpose, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    otpVerification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const redisClient = {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-2),
    setex: jest.fn().mockResolvedValue('OK'),
  };
  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('access-token'),
    verifyAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const redisService = { getClient: () => redisClient };
    service = new AuthService(
      prisma as never,
      jwtService as never,
      redisService as never,
    );
  });

  it('rejects duplicate email on register when account is verified', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'taken@example.com',
      status: UserStatus.ACTIVE,
    });
    await expect(
      service.register({
        email: 'taken@example.com',
        password: 'SecurePass1!',
        firstName: 'A',
        lastName: 'B',
      }),
    ).rejects.toMatchObject({ response: { code: 'EMAIL_ALREADY_EXISTS' } });
  });

  it('allows re-register for unverified email and resends OTP', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'pending@example.com',
      mobile: null,
      status: UserStatus.PENDING_VERIFICATION,
    });
    prisma.user.update.mockResolvedValue({
      id: 'u1',
      email: 'pending@example.com',
      status: UserStatus.PENDING_VERIFICATION,
    });
    prisma.otpVerification.create.mockResolvedValue({ id: 'otp1' });

    const result = await service.register({
      email: 'pending@example.com',
      password: 'SecurePass1!',
      firstName: 'Alex',
      lastName: 'Johnson',
    });

    expect(prisma.user.update).toHaveBeenCalled();
    expect(prisma.otpVerification.updateMany).toHaveBeenCalled();
    expect(prisma.otpVerification.create).toHaveBeenCalled();
    expect(result).toMatchObject({
      email: 'pending@example.com',
      status: UserStatus.PENDING_VERIFICATION,
      otpSent: true,
    });
  });

  it('rejects invalid OTP', async () => {
    prisma.otpVerification.findFirst.mockResolvedValue({
      id: 'otp1',
      codeHash: await bcrypt.hash('999999', 10),
      attempts: 0,
    });
    await expect(
      service.verifyOtp({
        email: 'user@example.com',
        code: '123456',
        purpose: OtpPurpose.REGISTRATION,
      }),
    ).rejects.toMatchObject({ response: { code: 'INVALID_OTP' } });
  });

  it('rejects login for unverified account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('SecurePass1!', 12),
      status: UserStatus.PENDING_VERIFICATION,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
    await expect(
      service.login({ email: 'user@example.com', password: 'SecurePass1!' }),
    ).rejects.toMatchObject({ response: { code: 'ACCOUNT_NOT_VERIFIED' } });
  });
});
