import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Budgets')
@Controller('budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(
    @Inject('BUDGET_SERVICE') private readonly budgetClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Create a new budget' })
  async create(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.create', { ...body, userId }),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Get all budgets' })
  async findAll(@CurrentUser('userId') userId: string): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.find_all', { userId }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Get budget by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.find_one', { id, userId }),
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Update budget' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.update', { id, ...body, userId }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Delete budget' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.delete', { id, userId }),
    );
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({ summary: 'Get budget progress' })
  async progress(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.progress', { id, userId }),
    );
  }

  // Admin endpoints
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get budget statistics for admin' })
  async getAdminStats(): Promise<unknown> {
    return firstValueFrom(
      this.budgetClient.send('budget.admin_stats', {}),
    );
  }
}
