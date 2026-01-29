import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { FeatureGuard } from '../common/guards/feature.guard.js';
import { OcrUploadService } from './upload.service.js';

@ApiTags('OCR')
@Controller('ocr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OcrsController {
  constructor(
    @Inject('OCR_SERVICE') private readonly ocrClient: ClientProxy,
    private readonly uploadService: OcrUploadService,
  ) { }

  @Post('scan')
  @UseGuards(FeatureGuard('OCR'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Scan invoice (QR code or OCR text)',
    description: 'Upload invoice image for scanning. Attempts QR code detection first (Vietnamese e-invoice format), falls back to OCR text recognition if QR not found. Returns job ID for tracking.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Invoice image file (JPEG, PNG, WEBP, max 10MB)'
        }
      },
      required: ['file']
    }
  })
  async scan(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    // Upload file to Cloudinary and get URL
    const fileUrl = await this.uploadService.saveFile(file);

    // Send to OCR service for processing
    return firstValueFrom(
      this.ocrClient.send('ocr.scan', { fileUrl, userId }),
    );
  }

  @Get('jobs')
  @ApiOperation({
    summary: 'Get OCR/QR job history',
    description: 'Retrieves list of all scanning jobs (both QR and OCR) for the current user.'
  })
  async getHistory(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.history', { ...query, userId }),
    );
  }

  @Get('jobs/:jobId')
  @ApiOperation({
    summary: 'Get specific job details',
    description: 'Retrieves detailed results of a scanning job, including QR data (if detected), OCR text, parsed expense data, and confidence scores.'
  })
  async findOne(
    @Param('jobId') jobId: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.find_one', { jobId, userId }),
    );
  }

  // Admin endpoints
  @Get('admin/stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get OCR statistics for admin' })
  async getAdminStats(): Promise<any> {
    return firstValueFrom(
      this.ocrClient.send('ocr.admin_stats', {}),
    );
  }
}
