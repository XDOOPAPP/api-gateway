import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum RevenuePeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

export class RevenueStatsQueryDto {
    @ApiPropertyOptional({
        enum: RevenuePeriod,
        default: RevenuePeriod.DAILY,
        description: 'Grouping period for revenue statistics',
    })
    @IsOptional()
    @IsEnum(RevenuePeriod)
    period?: RevenuePeriod = RevenuePeriod.DAILY;

    @ApiPropertyOptional({
        default: 30,
        description: 'Number of days to look back for statistics',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    days?: number = 30;
}
