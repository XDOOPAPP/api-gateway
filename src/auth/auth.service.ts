import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  private authServiceUrl =
    process.env.AUTH_SERVICE_URL || 'http://fepa-auth-service:3001/api/v1/auth';

  constructor(private readonly httpService: HttpService) {}

  private handleError(error: any, defaultMessage: string): Promise<any> {
    throw new HttpException(
      error.response?.data?.message || defaultMessage,
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/register`, registerDto),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Registration failed');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/verify-otp`,
          verifyOtpDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'OTP verification failed');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/login`, loginDto),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Login failed');
    }
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/refresh`,
          refreshTokenDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Token refresh failed');
    }
  }

  async getProfile(token: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch profile');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/forgot-password`,
          forgotPasswordDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to send reset OTP');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/reset-password`,
          resetPasswordDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to reset password');
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
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
      // Don't throw for verification check, just return false or let the caller decide?
      // usage in controller was: throw HttpException
      this.handleError(error, 'Token verification failed');
    }
  }
}
