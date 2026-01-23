import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionService } from '../subscriptions/subscription.service.js';

@Injectable()
export class AuthClient {
    private authServiceUrl: string;
    private featureCache = new Map<string, any>();

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly subscriptionService: SubscriptionService,
    ) {
        const authConfig = this.configService.get('services.auth');
        if (!authConfig || !authConfig.host || !authConfig.port) {
            throw new Error(
                'Auth service configuration is missing. Please set AUTH_SERVICE_HOST and AUTH_SERVICE_PORT environment variables.',
            );
        }
        this.authServiceUrl = `http://${authConfig.host}:${authConfig.port}/api/v1/auth`;
    }

    private handleError(error: any, defaultMessage: string): never {
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

    async register(registerDto: any): Promise<any> {
        try {
            const response: AxiosResponse<any> = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/register`, registerDto),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Registration failed');
        }
    }

    async registerAdmin(token: string, registerAdminDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.authServiceUrl}/register-admin`,
                    registerAdminDto,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Admin registration failed');
        }
    }

    async getAllAdmin(token: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/all-admin`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch admin list');
        }
    }

    async verifyOtp(verifyOtpDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/verify-otp`, verifyOtpDto),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'OTP verification failed');
        }
    }

    async resendOtp(resendOtpDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/resend-otp`, resendOtpDto),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to resend OTP');
        }
    }

    async login(loginDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/login`, loginDto),
            );

            const { accessToken, refreshToken } = response.data;
            const decoded: any = this.jwtService.decode(accessToken);
            const userId = decoded.userId;

            // Fetch features and cache them
            const features = await this.subscriptionService.getInternalUserFeatures(userId);
            this.featureCache.set(userId, features);

            return {
                accessToken,
                refreshToken,
                features,
            };
        } catch (error) {
            this.handleError(error, 'Login failed');
        }
    }

    async refresh(refreshTokenDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/refresh`, refreshTokenDto),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Token refresh failed');
        }
    }

    async getProfile(token: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch profile');
        }
    }

    async forgotPassword(forgotPasswordDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
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

    async resetPassword(resetPasswordDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
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
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.authServiceUrl}/verify`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Token verification failed');
        }
    }

    async fcmToken(token: string, fcmTokenDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.authServiceUrl}/fcm-token`, fcmTokenDto, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to update FCM token');
        }
    }

    async changePassword(token: string, changePasswordDto: any): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.authServiceUrl}/change-password`,
                    changePasswordDto,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to change password');
        }
    }

    async updateProfile(token: string, updateProfileDto: any, avatarFile?: Express.Multer.File): Promise<any> {
        try {
            const formData = new FormData();
            if (updateProfileDto.email) formData.append('email', updateProfileDto.email);
            if (updateProfileDto.fullName) formData.append('fullName', updateProfileDto.fullName);
            if (avatarFile) {
                const blob = new Blob([(avatarFile.buffer as any)], { type: avatarFile.mimetype });
                formData.append('avatar', blob, avatarFile.originalname);
            }

            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.authServiceUrl}/update-profile`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to update profile');
        }
    }

    async getCachedFeatures(userId: string): Promise<any> {
        if (this.featureCache.has(userId)) {
            return this.featureCache.get(userId);
        }
        const features = await this.subscriptionService.getInternalUserFeatures(userId);
        if (features) {
            this.featureCache.set(userId, features);
        }
        return features;
    }

    // User Management CRUD Methods

    async getAllUsers(token: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch users');
        }
    }

    async deleteUser(token: string, userId: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${this.authServiceUrl}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to delete user');
        }
    }

    async deactivateUser(token: string, userId: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(
                    `${this.authServiceUrl}/users/${userId}/deactivate`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to deactivate user');
        }
    }

    async reactivateUser(token: string, userId: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.patch(
                    `${this.authServiceUrl}/users/${userId}/reactivate`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to reactivate user');
        }
    }

    // Statistics Methods

    async getUsersOverTime(token: string, period: string = 'daily', days: number = 30): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.authServiceUrl}/stats/users-over-time?period=${period}&days=${days}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch users over time statistics');
        }
    }

    async getTotalUsersStats(token: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.authServiceUrl}/stats/total`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch total users statistics');
        }
    }

}
