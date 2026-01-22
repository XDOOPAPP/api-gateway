import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import type { Request } from 'express';
import { AuthClient } from './auth.client.js';
import { RegisterDto } from './dto/register.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { FcmTokenDto } from './dto/fcm-token.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClient) { }

  @Post('fcm-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user FCM token' })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async fcmToken(
    @Req() request: Request,
    @Body() fcmTokenDto: FcmTokenDto,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    return this.authClient.fcmToken(token, fcmTokenDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new account' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to email',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    return this.authClient.register(registerDto);
  }

  @Post('register-admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Register new admin account' })
  @ApiResponse({
    status: 200,
    description: 'Admin created successfully',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async registerAdmin(
    @Req() request: Request,
    @Body() registerAdminDto: RegisterAdminDto,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    return this.authClient.registerAdmin(token, registerAdminDto);
  }

  @Get('all-admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all admin accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of admin accounts',
    type: [RegisterAdminDto], // Or a more specific response DTO if needed
  })
  async getAllAdmin(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    return this.authClient.getAllAdmin(token);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and complete registration' })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.authClient.verifyOtp(verifyOtpDto);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to email' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent to email',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<any> {
    return this.authClient.resendOtp(resendOtpDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authClient.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<any> {
    return this.authClient.refresh(refreshTokenDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        fullName: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  async getProfile(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.getProfile(token);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset (send OTP)' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to email',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    return this.authClient.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<any> {
    return this.authClient.resetPassword(resetPasswordDto);
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify token validity' })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    schema: {
      properties: {
        valid: { type: 'boolean' },
        userId: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  async verifyToken(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.verifyToken(token);
  }

  // User Management CRUD Endpoints

  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      properties: {
        data: { type: 'array' },
      },
    },
  })
  async getAllUsers(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.getAllUsers(token);
  }

  @Delete('users/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async deleteUser(
    @Req() request: Request,
    @Param('userId') userId: string,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.deleteUser(token, userId);
  }

  @Patch('users/:userId/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated',
  })
  async deactivateUser(
    @Req() request: Request,
    @Param('userId') userId: string,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.deactivateUser(token, userId);
  }

  @Patch('users/:userId/reactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reactivate user account' })
  @ApiResponse({
    status: 200,
    description: 'User reactivated',
  })
  async reactivateUser(
    @Req() request: Request,
    @Param('userId') userId: string,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.reactivateUser(token, userId);
  }

  // Statistics Endpoints

  @Get('stats/users-over-time')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get users over time for charting' })
  @ApiResponse({
    status: 200,
    description: 'User statistics over time',
    schema: {
      properties: {
        period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
        days: { type: 'number' },
        data: { type: 'array' },
      },
    },
  })
  async getUsersOverTime(
    @Req() request: Request,
    @Query('period') period: string = 'daily',
    @Query('days') days: string = '30',
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.getUsersOverTime(token, period, parseInt(days));
  }

  @Get('stats/total')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get total users statistics' })
  @ApiResponse({
    status: 200,
    description: 'Total users statistics',
    schema: {
      properties: {
        total: { type: 'number' },
        verified: { type: 'number' },
        admin: { type: 'number' },
        user: { type: 'number' },
      },
    },
  })
  async getTotalUsersStats(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.authClient.getTotalUsersStats(token);
  }

}
