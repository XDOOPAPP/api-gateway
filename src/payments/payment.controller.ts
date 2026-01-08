import {
    Controller,
    Get,
    Post,
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
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new payment' })
    @ApiResponse({
        status: 201,
        description: 'Payment created successfully',
    })
    async createPayment(
        @Req() request: Request,
        @Body() createPaymentDto: CreatePaymentDto,
    ): Promise<any> {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }
        const userId = (request as any).user?.userId;
        return this.paymentService.createPayment(token, userId, createPaymentDto);
    }

    @Get('vnpay/ipn')
    @ApiOperation({ summary: 'VNPay IPN callback (public)' })
    @ApiResponse({
        status: 200,
        description: 'IPN processed successfully',
    })
    async vnpayIPN(@Query() query: any): Promise<any> {
        return this.paymentService.handleVNPayIPN(query);
    }

    @Get(':ref')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get payment status by reference' })
    @ApiResponse({
        status: 200,
        description: 'Payment status retrieved',
    })
    async getPaymentStatus(
        @Req() request: Request,
        @Param('ref') ref: string,
    ): Promise<any> {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }
        const userId = (request as any).user?.userId;
        return this.paymentService.getPaymentStatus(token, userId, ref);
    }
}
