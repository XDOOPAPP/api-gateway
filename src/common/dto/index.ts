import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateExpenseDto {
  @ApiProperty({ example: 'Cà phê', description: 'Mô tả chi tiêu' })
  @IsString()
  description: string;

  @ApiProperty({ example: 50000, description: 'Số tiền (VND)' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'food' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: '2025-12-11' })
  @IsDateString()
  date: string;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 'Chi phí ăn uống', description: 'Tên ngân sách' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'food' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5000000, description: 'Giới hạn (VND)' })
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;
}
