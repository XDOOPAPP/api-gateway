import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { BlogUploadService } from './upload.service.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BLOG_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url') || 'amqp://localhost:5672'],
            queue: 'blog_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogUploadService],
})
export class BlogsModule { }
