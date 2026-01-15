import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    UseGuards,
    HttpException,
    HttpStatus,
    Req,
    Body,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    private extractTokenAndUser(request: Request) {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }
        const userId = (request as any).user?.userId;
        if (!userId) {
            throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
        }
        return { token, userId };
    }

    @Post()
    @ApiOperation({ summary: 'Create a notification' })
    @Roles('ADMIN')
    @ApiResponse({
        status: 201,
        description: 'Notification created',
    })
    async createNotification(
        @Req() request: Request,
        @Body() createNotificationDto: CreateNotificationDto,
    ) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.createNotification(token, userId, createNotificationDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({
        status: 200,
        description: 'List of notifications',
    })
    async getNotifications(
        @Req() request: Request,
        @Query() query: GetNotificationsDto,
    ) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.getNotifications(token, userId, query);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notifications count' })
    @ApiResponse({
        status: 200,
        description: 'Count of unread notifications',
    })
    async getUnreadCount(@Req() request: Request) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.getUnreadCount(token, userId);
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({
        status: 200,
        description: 'Notification marked as read',
    })
    async markAsRead(
        @Req() request: Request,
        @Param('id') id: string,
    ) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.markAsRead(token, userId, id);
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({
        status: 200,
        description: 'All notifications marked as read',
    })
    async markAllAsRead(@Req() request: Request) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.markAllAsRead(token, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({
        status: 200,
        description: 'Notification deleted',
    })
    async deleteNotification(
        @Req() request: Request,
        @Param('id') id: string,
    ) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.deleteNotification(token, userId, id);
    }

    @Delete()
    @ApiOperation({ summary: 'Delete all notifications' })
    @ApiResponse({
        status: 200,
        description: 'All notifications deleted',
    })
    async deleteAllNotifications(@Req() request: Request) {
        const { token, userId } = this.extractTokenAndUser(request);
        return this.notificationsService.deleteAllNotifications(token, userId);
    }
}
