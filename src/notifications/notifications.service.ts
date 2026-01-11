import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
    private readonly notificationServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const notificationConfig = this.configService.get('services.notification');

        if (!notificationConfig || !notificationConfig.host || !notificationConfig.port) {
            throw new Error(
                'Notification service configuration is missing. Please set NOTIFICATION_SERVICE_HOST and NOTIFICATION_SERVICE_PORT environment variables.',
            );
        }

        this.notificationServiceUrl = `http://${notificationConfig.host}:${notificationConfig.port}/api/v1/notifications`;
    }

    private handleError(error: any, defaultMessage: string) {
        console.error('[NotificationsService Error]', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new HttpException(
                'Cannot connect to notification-service. Please ensure notification-service is running.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        if (error.code === 'ETIMEDOUT') {
            throw new HttpException(
                'Notification service request timeout',
                HttpStatus.REQUEST_TIMEOUT,
            );
        }

        if (error.response) {
            const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response.data?.message || defaultMessage;
            throw new HttpException(message, status);
        }

        throw new HttpException(
            error.message || defaultMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    private getHeaders(token: string, userId: string) {
        return {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId,
        };
    }

    async createNotification(token: string, userId: string, data: any) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(this.notificationServiceUrl, data, {
                    headers: this.getHeaders(token, userId),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to create notification');
        }
    }

    async getNotifications(token: string, userId: string, query: any) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(this.notificationServiceUrl, {
                    headers: this.getHeaders(token, userId),
                    params: query,
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to get notifications');
        }
    }

    async getUnreadCount(token: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.notificationServiceUrl}/unread-count`, {
                    headers: this.getHeaders(token, userId),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to get unread count');
        }
    }

    async markAsRead(token: string, userId: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.notificationServiceUrl}/${id}/read`,
                    {},
                    {
                        headers: this.getHeaders(token, userId),
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to mark notification as read');
        }
    }

    async markAllAsRead(token: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.notificationServiceUrl}/read-all`,
                    {},
                    {
                        headers: this.getHeaders(token, userId),
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to mark all notifications as read');
        }
    }

    async deleteNotification(token: string, userId: string, id: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(`${this.notificationServiceUrl}/${id}`, {
                    headers: this.getHeaders(token, userId),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to delete notification');
        }
    }

    async deleteAllNotifications(token: string, userId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.delete(this.notificationServiceUrl, {
                    headers: this.getHeaders(token, userId),
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to delete all notifications');
        }
    }
}
