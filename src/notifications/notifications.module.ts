import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule { }
