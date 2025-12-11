import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }
}
