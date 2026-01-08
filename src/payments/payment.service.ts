import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
    private readonly paymentServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        const paymentConfig = this.configService.get('services.payment');

        if (!paymentConfig || !paymentConfig.host || !paymentConfig.port) {
            throw new Error(
                'Payment service configuration is missing. Please set PAYMENT_SERVICE_HOST and PAYMENT_SERVICE_PORT environment variables.',
            );
        }

        this.paymentServiceUrl = `http://${paymentConfig.host}:${paymentConfig.port}/api/v1/payments`;
    }

    private handleError(error: any, defaultMessage: string) {
        // Log error for debugging
        console.error('[PaymentService Error]', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });

        // Handle connection errors (service not available)
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            throw new HttpException(
                `Cannot connect to payment-service. Please ensure payment-service is running.`,
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        // Handle timeout errors
        if (error.code === 'ETIMEDOUT') {
            throw new HttpException(
                'Payment service request timeout',
                HttpStatus.REQUEST_TIMEOUT,
            );
        }

        // Handle HTTP errors from payment-service
        if (error.response) {
            const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response.data?.message || defaultMessage;
            throw new HttpException(message, status);
        }

        // Handle other errors
        throw new HttpException(
            error.message || defaultMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    async createPayment(token: string, userId: string, createPaymentDto: any) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.paymentServiceUrl}`,
                    createPaymentDto,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'x-user-id': userId,
                        },
                    },
                ),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to create payment');
        }
    }

    async getPaymentStatus(token: string, userId: string, ref: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.paymentServiceUrl}/${ref}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'x-user-id': userId,
                    },
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to get payment status');
        }
    }

    async handleVNPayIPN(query: any) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.paymentServiceUrl}/vnpay/ipn`, {
                    params: query,
                }),
            );
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to handle VNPay IPN');
        }
    }
}
