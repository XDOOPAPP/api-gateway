import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axiosRetry from 'axios-retry';

@Injectable()
export class SubscriptionService {
  private readonly subscriptionServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const subscriptionConfig = this.configService.get('services.subscription');

    if (!subscriptionConfig || !subscriptionConfig.host || !subscriptionConfig.port) {
      throw new Error(
        'Subscription service configuration is missing. Please set SUBSCRIPTION_SERVICE_HOST and SUBSCRIPTION_SERVICE_PORT environment variables.',
      );
    }

    this.subscriptionServiceUrl = `http://${subscriptionConfig.host}:${subscriptionConfig.port}/api/v1/subscriptions`;

    // Configure retry logic
    axiosRetry(this.httpService.axiosRef, {
      retries: 5,
      retryDelay: (retryCount) => {
        return retryCount * 1000; // 1s, 2s, 3s, 4s, 5s
      },
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ENOTFOUND'
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(
          `[SubscriptionService] Retrying request... Attempt ${retryCount} for ${requestConfig.url}. Error: ${error.message}`,
        );
      },
    });
  }

  private handleError(error: any, defaultMessage: string) {
    // Log error for debugging
    console.error('[SubscriptionService Error]', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle connection errors (service not available)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new HttpException(
        `Cannot connect to subscription-service. Please ensure subscription-service is running.`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Handle timeout errors
    if (error.code === 'ETIMEDOUT') {
      throw new HttpException(
        'Subscription service request timeout',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    // Handle HTTP errors from subscription-service
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

  async getPlans() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/plans`),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch plans');
    }
  }

  async getPlanDetail(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/plans/${id}`),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch plan detail');
    }
  }

  async getCurrent(token: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch current subscription');
    }
  }

  async subscribe(token: string, userId: string, planId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.subscriptionServiceUrl}`,
          { planId },
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
      this.handleError(error, 'Failed to subscribe');
    }
  }

  async cancel(token: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.subscriptionServiceUrl}/cancel`,
          {},
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
      this.handleError(error, 'Failed to cancel subscription');
    }
  }

  async getHistory(token: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch subscription history');
    }
  }

  async getInternalUserFeatures(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/internal/user-features/${userId}`),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch internal user features');
    }
  }

  async createPlan(token: string, userId: string, planData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.subscriptionServiceUrl}/plans`,
          planData,
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
      this.handleError(error, 'Failed to create plan');
    }
  }

  async updatePlan(token: string, userId: string, id: string, planData: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.subscriptionServiceUrl}/plans/${id}`,
          planData,
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
      this.handleError(error, 'Failed to update plan');
    }
  }

  async disablePlan(token: string, userId: string, id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.subscriptionServiceUrl}/plans/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to disable plan');
    }
  }

  async getStats(token: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-user-id': userId,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch stats');
    }
  }

  async getRevenueOverTime(token: string, period: string = 'daily', days: number = 30): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.subscriptionServiceUrl}/stats/revenue-over-time?period=${period}&days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch revenue over time');
    }
  }

  async getTotalRevenueStats(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/stats/total-revenue`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch total revenue stats');
    }
  }

  async getRevenueByPlan(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.subscriptionServiceUrl}/stats/revenue-by-plan`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch revenue by plan');
    }
  }
}

