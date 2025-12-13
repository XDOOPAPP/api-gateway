import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CategoriesController } from './categories.controller.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EXPENSE_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: configService.get('services.expense'),
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
