import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanInterval {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    LIFETIME = 'LIFETIME',
}

export class CreatePlanDto {
    @ApiProperty({ example: 'Premium Plan' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 29.99 })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({ example: 'MONTHLY', enum: PlanInterval })
    @IsEnum(PlanInterval)
    @IsNotEmpty()
    interval: PlanInterval;

    @ApiProperty({ example: { OCR: true, AI: true } })
    @IsObject()
    @IsNotEmpty()
    features: Record<string, boolean>;

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isFree?: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}