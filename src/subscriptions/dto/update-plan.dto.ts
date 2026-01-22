import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanInterval } from './create-plan.dto.js';

export class UpdatePlanDto {
  @ApiProperty({ example: 'Premium Plan', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 29.99, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'MONTHLY', enum: PlanInterval, required: false })
  @IsEnum(PlanInterval)
  @IsOptional()
  interval?: PlanInterval;

  @ApiProperty({ example: { OCR: true, AI: true }, required: false })
  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}