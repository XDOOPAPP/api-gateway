import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

@ApiTags('Expenses')
@Controller('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(
    @Inject('EXPENSE_SERVICE') private readonly expenseClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  async create(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.create', { ...body, userId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  async findAll(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.findAll', { ...query, userId }),
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary' })
  async getSummary(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.summary', { ...query, userId }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.findOne', { id, userId }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.update', { id, ...body, userId }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.expenseClient.send('expense.remove', { id, userId }),
    );
  }
}
