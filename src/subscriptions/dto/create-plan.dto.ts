import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsArray, IsEnum, IsOptional } from 'class-validator';
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

    @ApiProperty({ example: ['feature1', 'feature2', 'feature3'] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiProperty({ example: false })
    @IsBoolean()
    @IsOptional()
    isFree?: boolean;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

