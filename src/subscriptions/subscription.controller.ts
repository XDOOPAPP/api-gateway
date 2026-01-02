import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { SubscriptionService } from './subscription.service.js';
import { SubscribeDto } from './dto/subscribe.dto.js';
import { PaymentSuccessDto } from './dto/payment-success.dto.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Public endpoints
  @Get('plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'List of active plans',
  })
  async getPlans(): Promise<any> {
    return this.subscriptionService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Plan details',
  })
  async getPlanDetail(@Param('id') id: string): Promise<any> {
    return this.subscriptionService.getPlanDetail(id);
  }

  // User endpoints (require auth)
  @Get('current')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Current subscription',
  })
  async getCurrent(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.getCurrent(token);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async subscribe(
    @Req() request: Request,
    @Body() subscribeDto: SubscribeDto,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.subscribe(token, subscribeDto.planId);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel current subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled',
  })
  async cancel(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.cancel(token);
  }

  @Get('history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiResponse({
    status: 200,
    description: 'Subscription history',
  })
  async getHistory(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.getHistory(token);
  }

  @Get('check')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if user has access to a feature' })
  @ApiResponse({
    status: 200,
    description: 'Feature access check result',
    schema: {
      properties: {
        allowed: { type: 'boolean' },
      },
    },
  })
  async checkFeature(
    @Req() request: Request,
    @Query('feature') feature: string,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    if (!feature) {
      throw new HttpException('Feature parameter is required', HttpStatus.BAD_REQUEST);
    }
    return this.subscriptionService.checkFeature(token, feature);
  }

  @Post('auto-renew')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle auto-renewal for current subscription' })
  @ApiResponse({
    status: 200,
    description: 'Auto-renewal toggled',
  })
  async toggleAutoRenew(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.toggleAutoRenew(token);
  }

  @Get('features')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all features available to current user' })
  @ApiResponse({
    status: 200,
    description: 'User features list',
  })
  async getUserFeatures(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.getUserFeatures(token);
  }

  // Payment endpoint (public, no auth required)
  @Post('payment/success')
  @ApiOperation({ summary: 'Activate subscription after successful payment' })
  @ApiResponse({
    status: 200,
    description: 'Subscription activated',
  })
  async paymentSuccess(@Body() paymentSuccessDto: PaymentSuccessDto): Promise<any> {
    return this.subscriptionService.paymentSuccess(paymentSuccessDto);
  }

  // Admin endpoints (require auth)
  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new subscription plan (Admin)' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully',
  })
  async createPlan(
    @Req() request: Request,
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.createPlan(token, createPlanDto);
  }

  @Patch('plans/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a subscription plan (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated successfully',
  })
  async updatePlan(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.updatePlan(token, id, updatePlanDto);
  }

  @Delete('plans/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disable a subscription plan (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Plan disabled successfully',
  })
  async disablePlan(
    @Req() request: Request,
    @Param('id') id: string,
  ): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.disablePlan(token, id);
  }

  @Get('admin/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get subscription statistics (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription statistics',
  })
  async getStats(@Req() request: Request): Promise<any> {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.subscriptionService.getStats(token);
  }
}

