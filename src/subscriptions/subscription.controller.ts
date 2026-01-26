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
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RevenueStatsQueryDto } from './dto/revenue-stats-query.dto.js';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    private getToken(request: Request): string {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }
        return token;
    }

    private getUserId(request: Request): string {
        const userId = (request as any).user?.userId;
        if (!userId) {
            throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }

    // Public endpoints
    @Get('plans')
    @ApiOperation({ summary: 'Get all active subscription plans' })
    @ApiResponse({ status: 200, description: 'List of active plans' })
    async getPlans(): Promise<any> {
        return this.subscriptionService.getPlans();
    }

    @Get('plans/:id')
    @ApiOperation({ summary: 'Get plan detail by ID' })
    @ApiResponse({ status: 200, description: 'Plan details' })
    async getPlanDetail(@Param('id') id: string): Promise<any> {
        return this.subscriptionService.getPlanDetail(id);
    }

    // User endpoints (require auth)
    @Get('current')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current active subscription' })
    @ApiResponse({ status: 200, description: 'Current subscription' })
    async getCurrent(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getCurrent(this.getToken(request), this.getUserId(request));
    }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Subscribe to a plan' })
    @ApiResponse({ status: 201, description: 'Subscription created successfully' })
    async subscribe(
        @Req() request: Request,
        @Body() subscribeDto: SubscribeDto,
    ): Promise<any> {
        return this.subscriptionService.subscribe(
            this.getToken(request),
            this.getUserId(request),
            subscribeDto.planId,
        );
    }

    @Post('cancel')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Cancel current subscription' })
    @ApiResponse({ status: 200, description: 'Subscription cancelled' })
    async cancel(@Req() request: Request): Promise<any> {
        return this.subscriptionService.cancel(this.getToken(request), this.getUserId(request));
    }

    @Get('history')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get subscription history' })
    @ApiResponse({ status: 200, description: 'Subscription history' })
    async getHistory(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getHistory(this.getToken(request), this.getUserId(request));
    }

    @Get('features')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all features available to current user' })
    @ApiResponse({ status: 200, description: 'User features list' })
    async getUserFeatures(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getInternalUserFeatures(this.getUserId(request));
    }

    // Admin endpoints (require auth)
    @Post('plans')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new subscription plan (Admin)' })
    @ApiResponse({ status: 201, description: 'Plan created successfully' })
    async createPlan(
        @Req() request: Request,
        @Body() createPlanDto: CreatePlanDto,
    ): Promise<any> {
        return this.subscriptionService.createPlan(
            this.getToken(request),
            this.getUserId(request),
            createPlanDto,
        );
    }

    @Patch('plans/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a subscription plan (Admin)' })
    @ApiResponse({ status: 200, description: 'Plan updated successfully' })
    async updatePlan(
        @Req() request: Request,
        @Param('id') id: string,
        @Body() updatePlanDto: UpdatePlanDto,
    ): Promise<any> {
        return this.subscriptionService.updatePlan(
            this.getToken(request),
            this.getUserId(request),
            id,
            updatePlanDto,
        );
    }

    @Delete('plans/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Disable a subscription plan (Admin)' })
    @ApiResponse({ status: 200, description: 'Plan disabled successfully' })
    async disablePlan(
        @Req() request: Request,
        @Param('id') id: string,
    ): Promise<any> {
        return this.subscriptionService.disablePlan(
            this.getToken(request),
            this.getUserId(request),
            id,
        );
    }

    @Get('admin/stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get general subscription statistics (Admin)' })
    @ApiResponse({ status: 200, description: 'General statistics' })
    async getStats(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getStats(this.getToken(request), this.getUserId(request));
    }

    @Get('stats/revenue-over-time')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get revenue over time for charting (Admin)' })
    @ApiResponse({ status: 200, description: 'Revenue statistics over time' })
    async getRevenueOverTime(
        @Req() request: Request,
        @Query() query: RevenueStatsQueryDto,
    ): Promise<any> {
        return this.subscriptionService.getRevenueOverTime(
            this.getToken(request),
            query.period,
            query.days,
        );
    }

    @Get('stats/total-revenue')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get total revenue breakdown (Admin)' })
    @ApiResponse({ status: 200, description: 'Total revenue statistics' })
    async getTotalRevenueStats(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getTotalRevenueStats(this.getToken(request));
    }

    @Get('stats/revenue-by-plan')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get revenue statistics by plan (Admin)' })
    @ApiResponse({ status: 200, description: 'Revenue by plan statistics' })
    async getRevenueByPlan(@Req() request: Request): Promise<any> {
        return this.subscriptionService.getRevenueByPlan(this.getToken(request));
    }
}
