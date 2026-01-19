import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { FcmTokenDto } from './dto/fcm-token.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';

@Injectable()
export class AuthService {
  private authServiceUrl =
    process.env.AUTH_SERVICE_URL || 'http://fepa-auth-service:3001/api/v1/auth';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const authConfig = this.configService.get('services.auth');

    if (!authConfig || !authConfig.host || !authConfig.port) {
      throw new Error(
        'Auth service configuration is missing. Please set AUTH_SERVICE_HOST and AUTH_SERVICE_PORT environment variables.',
      );
    }

    this.authServiceUrl = `http://${authConfig.host}:${authConfig.port}/api/v1/auth`;
  }

  private handleError(error: any, defaultMessage: string): Promise<any> {
    if (error.response) {
      throw new HttpException(
        error.response.data?.message || error.message || defaultMessage,
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    throw new HttpException(
      error.message || defaultMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      console.log(
        `[AuthService] Calling ${this.authServiceUrl}/register with:`,
        registerDto,
      );
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/register`, registerDto),
      );
      console.log(`[AuthService] Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Register error:`, error);
      this.handleError(error, 'Registration failed');
    }
  }

  async registerAdmin(
    token: string,
    registerAdminDto: RegisterAdminDto,
  ): Promise<any> {
    try {
      console.log(
        `[AuthService] Calling ${this.authServiceUrl}/register-admin with:`,
        registerAdminDto,
      );
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/register-admin`,
          registerAdminDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Register admin error:`, error.message);
      this.handleError(error, 'Admin registration failed');
    }
  }

  async getAllAdmin(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/all-admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Get all admin error:`, error.message);
      this.handleError(error, 'Failed to fetch admin list');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    try {
      console.log(`[AuthService] Verifying OTP:`, verifyOtpDto.email);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/verify-otp`,
          verifyOtpDto,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Verify OTP error:`, error.message);
      this.handleError(error, 'OTP verification failed');
    }
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<any> {
    try {
      console.log(`[AuthService] Resending OTP to:`, resendOtpDto.email);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/resend-otp`,
          resendOtpDto,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Resend OTP error:`, error.message);
      this.handleError(error, 'Failed to resend OTP');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      console.log(`[AuthService] Logging in user:`, loginDto.email);
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/login`, loginDto),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Login error at ${this.authServiceUrl}/login:`, error.message);
      if (error.response) {
        console.error(`[AuthService] Remote response:`, error.response.data);
      }
      this.handleError(error, 'Login failed');
    }
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/refresh`,
          refreshTokenDto,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Refresh token error:`, error.message);
      this.handleError(error, 'Token refresh failed');
    }
  }

  async getProfile(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Get profile error:`, error.message);
      this.handleError(error, 'Failed to fetch profile');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      console.log(`[AuthService] Forgot password request for:`, forgotPasswordDto.email);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/forgot-password`,
          forgotPasswordDto,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Forgot password error:`, error.message);
      this.handleError(error, 'Failed to send reset OTP');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    try {
      console.log(`[AuthService] Resetting password for:`, resetPasswordDto.email);
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/reset-password`,
          resetPasswordDto,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Reset password error:`, error.message);
      this.handleError(error, 'Failed to reset password');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Verify token error:`, error.message);
      this.handleError(error, 'Token verification failed');
    }
  }

  async fcmToken(token: string, fcmTokenDto: FcmTokenDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/fcm-token`,
          fcmTokenDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error(`[AuthService] Update FCM token error:`, error.message);
      this.handleError(error, 'Failed to update FCM token');
    }
  }

}
