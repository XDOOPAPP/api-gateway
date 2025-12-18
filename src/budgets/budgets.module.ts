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
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('services.budget.host'),
                        port: configService.get('services.budget.port'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [BudgetsController],
})
export class BudgetsModule { }
