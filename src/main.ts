import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS Configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Debug Logging Middleware
  app.use((req, res, next) => {
    console.log(`[Gateway] Incoming Request: ${req.method} ${req.url}`);
    next();
  });

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving static files
  }));
  app.use(compression());

  // Serve static files from uploads directory
  const uploadPath = process.env.UPLOAD_DIR || '/app/uploads';
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  logger.log(`📁 Static files serving from: ${uploadPath} at /uploads`);

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

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

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
