import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum UserStatsPeriod {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

export class UserStatsQueryDto {
    @ApiPropertyOptional({
        enum: UserStatsPeriod,
        default: UserStatsPeriod.DAILY,
        description: 'Grouping period for user statistics',
    })
    @IsOptional()
    @IsEnum(UserStatsPeriod)
    period?: UserStatsPeriod = UserStatsPeriod.DAILY;

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
