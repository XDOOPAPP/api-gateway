import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller.js';
import { gatewayConfig } from './config/gateway.config.js';
import { JwtStrategy } from './common/strategies/jwt.strategy.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { CategoriesModule } from './categories/categories.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.auth'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'EXPENSE_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.expense'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'BUDGET_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.budget'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'BLOG_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.blog'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'SUBSCRIPTION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.subscription'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.notification'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'OCR_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.ocr'),
        }),
        inject: [ConfigService],
      },
      {
        name: 'AI_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.ai'),
        }),
        inject: [ConfigService],
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ExpensesModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [JwtStrategy],
})
export class AppModule {}
