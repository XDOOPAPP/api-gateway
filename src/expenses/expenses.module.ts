import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ExpensesController } from './expenses.controller.js';

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
  controllers: [ExpensesController],
})
export class ExpensesModule {}
