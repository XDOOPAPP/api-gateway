import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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

@ApiTags('OCR')
@Controller('ocr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OcrsController {
  constructor(
    @Inject('OCR_SERVICE') private readonly ocrClient: ClientProxy,
  ) { }

  @Post('scan')
  @ApiOperation({ summary: 'Create new OCR job' })
  async scan(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.scan', { ...body, userId }),
    );
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get OCR job history' })
  async getHistory(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.history', { ...query, userId }),
    );
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get specific OCR job by ID' })
  async findOne(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.find_one', { jobId, userId }),
    );
  }
}
