import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Categories')
@Controller('expenses/categories')
export class CategoriesController {
  constructor(
    @Inject('EXPENSE_SERVICE') private readonly expenseClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all expense categories (Public)' })
  async findAll(): Promise<any> {
    return firstValueFrom(this.expenseClient.send('category.findAll', {}));
  }
}
