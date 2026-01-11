import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationTarget {
    ADMINS = 'ADMINS',
    ALL = 'ALL',
}

export class CreateNotificationDto {
    @ApiProperty({ example: 'Notification Title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Notification Message' })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({ enum: NotificationTarget, example: NotificationTarget.ADMINS })
    @IsEnum(NotificationTarget)
    target: NotificationTarget;

    @ApiProperty({ example: 'INFO', required: false })
    @IsOptional()
    @IsString()
    type?: string;
}
