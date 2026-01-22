import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetUsersQueryDto {
  @ApiProperty({ example: 1, required: false, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false, description: 'Limit per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ example: 'USER', required: false, enum: ['USER', 'ADMIN'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: true, required: false, description: 'Filter by verification status' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ example: 'john', required: false, description: 'Search by email or fullName' })
  @IsOptional()
  @IsString()
  search?: string;
}
