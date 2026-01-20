import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthClient } from './auth.client.js';
import { SubscriptionModule } from '../subscriptions/subscription.module.js';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    SubscriptionModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthClient],
  exports: [AuthClient],
})
export class AuthModule { }
