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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { BlogUploadService } from './upload.service.js';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject('BLOG_SERVICE') private readonly blogClient: ClientProxy,
    private readonly uploadService: BlogUploadService,
  ) { }

  // ========== USER ENDPOINTS ==========

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create blog (Any authenticated user)' })
  async create(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.create', { ...body, userId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs (Public, filter by status/userId)' })
  async findAll(@Query() query: any): Promise<any> {
    return firstValueFrom(this.blogClient.send('blog.find_all', query));
  }

  @Get('my-blogs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my blogs' })
  async getMyBlogs(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.find_all', { ...query, userId }),
    );
  }

  // ========== STATISTICS ENDPOINTS (Must be before :id routes) ==========

  @Get('statistics/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get blog statistics by status (Admin only) - For pie chart' })
  async getStatusStatistics(): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.statistics.status', {}),
    );
  }

  @Get('statistics/monthly')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get monthly blog statistics (Admin only) - For column chart' })
  async getMonthlyStatistics(@Query('year') year?: string): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.statistics.monthly', { 
        year: year ? parseInt(year) : undefined 
      }),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get blog by slug (Public)' })
  async findBySlug(@Param('slug') slug: string): Promise<any> {
    return firstValueFrom(this.blogClient.send('blog.find_by_slug', slug));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID (Public)' })
  async findOne(@Param('id') id: string): Promise<any> {
    return firstValueFrom(this.blogClient.send('blog.find_one', id));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own blog (draft only)' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.update', { id, userId, data: body }),
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete own blog' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.delete', { id, userId }),
    );
  }

  @Post(':id/submit')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit blog for review (draft -> pending)' })
  async submitForReview(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.submit_for_review', { id, userId }),
    );
  }

  // ========== ADMIN ENDPOINTS ==========

  @Post(':id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve blog (Admin only)' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.approve', { id, approveDto: { adminId } }),
    );
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Reject blog (Admin only)' })
  async reject(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
    @CurrentUser('userId') adminId: string,
  ): Promise<any> {
    return firstValueFrom(
      this.blogClient.send('blog.reject', {
        id,
        rejectDto: { adminId, rejectionReason: body.rejectionReason },
      }),
    );
  }

  // ========== UPLOAD ENDPOINTS ==========

  @Post('upload/single')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload single image' })
  async uploadSingle(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const url = this.uploadService.saveFile(file);
    return { url };
  }

  @Post('upload/multiple')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]): Promise<any> {
    const urls = this.uploadService.saveFiles(files);
    return { urls };
  }
}
