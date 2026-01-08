import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
    @ApiProperty({
        description: 'Subscription ID',
        example: '507f1f77bcf86cd799439011',
    })
    @IsString()
    @IsNotEmpty()
    subscriptionId: string;

    @ApiProperty({
        description: 'Plan ID',
        example: '507f1f77bcf86cd799439012',
    })
    @IsString()
    @IsNotEmpty()
    planId: string;
}
