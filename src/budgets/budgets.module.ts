import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { BudgetsController } from './budgets.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BUDGET_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url') || 'amqp://localhost:5672'],
            queue: 'budget_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BudgetsController],
})
export class BudgetsModule { }
