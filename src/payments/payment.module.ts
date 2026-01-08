import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule { }
