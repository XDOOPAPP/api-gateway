import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('FEPA API Gateway')
    .setDescription('API Gateway cho hệ thống FEPA Microservices')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT token',
      },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Development')
    .addServer('http://api.fepa.local', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);

  logger.log(`✅ API Gateway đang chạy trên port ${port}`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/docs`);
  logger.log(`🔍 Health: http://localhost:${port}/api/v1/health`);
}
bootstrap();
