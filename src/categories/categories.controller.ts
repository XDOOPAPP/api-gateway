import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Categories')
@Controller('expenses/categories')
export class CategoriesController {
  constructor(
    @Inject('EXPENSE_SERVICE') private readonly expenseClient: ClientProxy,
  ) {}

  @Get()
  async findAll(): Promise<any> {
    return firstValueFrom(this.expenseClient.send('categories.findAll', {}));
  }
}
