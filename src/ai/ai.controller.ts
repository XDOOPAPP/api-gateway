import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(@Inject('AI_SERVICE') private readonly aiClient: ClientProxy) { }

  @Post('categorize')
  @ApiOperation({
    summary: 'Auto-categorize expense using AI',
    description:
      'Automatically categorize an expense based on description and amount using rule-based AI',
  })
  async categorizeExpense(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.categorize_expense', { ...body, userId }),
    );
  }

  @Get('predict-spending')
  @ApiOperation({
    summary: 'Predict future spending',
    description:
      'Predict future spending based on historical data using statistical analysis',
  })
  async predictSpending(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.predict_spending', { ...query, userId }),
    );
  }

  @Get('anomalies')
  @ApiOperation({
    summary: 'Detect unusual expenses',
    description:
      'Detect anomalies in spending patterns using statistical analysis',
  })
  async detectAnomalies(
    @Query() query: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.detect_anomalies', { ...query, userId }),
    );
  }

  @Get('budget-alerts')
  @ApiOperation({
    summary: 'Get smart budget alerts',
    description:
      'Get intelligent budget alerts based on spending patterns and budget limits',
  })
  async getBudgetAlerts(
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.budget_alerts', { userId }),
    );
  }

  @Post('assistant/chat')
  @ApiOperation({
    summary: 'Chat with AI financial assistant (Gemini 2.0)',
    description:
      'Chat with AI assistant powered by Google Gemini 2.0 for personalized financial advice',
  })
  async chatWithAssistant(
    @Body() body: any,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.assistant_chat', { ...body, userId }),
    );
  }

  @Get('insights')
  @ApiOperation({
    summary: 'Get AI-powered financial insights',
    description:
      'Get comprehensive financial insights including predictions, anomalies, and alerts',
  })
  async getInsights(
    @Query('period') period: string,
    @CurrentUser('userId') userId: string,
  ): Promise<unknown> {
    return firstValueFrom(
      this.aiClient.send('ai.get_insights', { period, userId }),
    );
  }
}
