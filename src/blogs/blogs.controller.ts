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
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject('BLOG_SERVICE') private readonly blogsService: ClientProxy,
  ) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create blog (Admin only)' })
  async create(@Body() body: any) {
    return firstValueFrom(this.blogsService.send('blog.create', body));
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs (Public)' })
  async findAll(@Query() query: any) {
    return firstValueFrom(this.blogsService.send('blog.find_all', query));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get blog by slug (Public)' })
  async findBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.blogsService.send('blog.find_by_slug', slug));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update blog (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.blogsService.send('blog.update', { id, data: body }));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete blog (Admin only)' })
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.blogsService.send('blog.delete', id));
  }
}
