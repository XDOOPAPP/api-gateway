import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BLOG_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.blog'),
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BlogsController],
})
export class BlogsModule {}
