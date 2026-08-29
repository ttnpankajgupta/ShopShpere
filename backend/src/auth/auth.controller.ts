import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { successResponse } from '../common/response.types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService, PublicUser } from '../auth/auth.service';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { RefreshDto } from '../auth/dto/refresh.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { SendOtpDto } from '../auth/dto/send-otp.dto';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';

@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current customer profile' })
  me(@Req() req: Request & { user: PublicUser }) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(req.user, requestId);
  }
}

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.register(dto), requestId);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send or resend OTP' })
  async sendOtp(@Body() dto: SendOtpDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.sendOtp(dto), requestId);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and establish session' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.verifyOtp(dto), requestId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.login(dto), requestId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.refresh(dto), requestId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Body() dto: RefreshDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.logout(dto), requestId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.forgotPassword(dto), requestId);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(await this.authService.resetPassword(dto), requestId);
  }
}
