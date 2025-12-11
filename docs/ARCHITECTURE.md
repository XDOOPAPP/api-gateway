# FEPA API Gateway - Kiến Trúc Chi Tiết

> Tài liệu này mô tả chi tiết kiến trúc và kế hoạch triển khai API Gateway cho hệ thống FEPA Microservices.

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Phân Tích Hiện Trạng](#2-phân-tích-hiện-trạng)
3. [Thiết Kế API Gateway](#3-thiết-kế-api-gateway)
4. [Kế Hoạch Triển Khai](#4-kế-hoạch-triển-khai)
5. [Chi Tiết Các Module](#5-chi-tiết-các-module)
6. [Cross-Cutting Concerns](#6-cross-cutting-concerns)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Monitoring & Logging](#8-monitoring--logging)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Business Context

FEPA (Financial & Expense Planning Application) là hệ thống quản lý tài chính cá nhân với các tính năng:

| Service                  | Chức năng                                         |
| ------------------------ | ------------------------------------------------- |
| **auth-service**         | Đăng ký, đăng nhập, quản lý user, JWT tokens      |
| **expense-service**      | CRUD chi tiêu, categorization, recurring expenses |
| **budget-service**       | Tạo/quản lý ngân sách, alerts khi vượt ngân sách  |
| **blog-service**         | Bài viết tài chính, tips tiết kiệm                |
| **subscription-service** | Gói premium, thanh toán, billing                  |
| **notification-service** | Push notifications, email, SMS                    |
| **ocr-service**          | Scan hóa đơn, extract thông tin tự động           |
| **ai-service**           | Phân tích chi tiêu, recommendations, predictions  |

### 1.2 Kiến Trúc Tổng Thể

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           LOAD BALANCER                                       │
│                         (Nginx / AWS ALB)                                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Auth Guard  │ │ Rate Limit  │ │  Logging    │ │  Transform  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
│  ┌──────────────────────────────────────────────────────────────┐            │
│  │                     ROUTING LAYER                            │            │
│  │  /api/v1/auth/*    → AUTH_SERVICE                           │            │
│  │  /api/v1/expenses/* → EXPENSE_SERVICE                        │            │
│  │  /api/v1/budgets/* → BUDGET_SERVICE                          │            │
│  │  /api/v1/blogs/*   → BLOG_SERVICE                            │            │
│  │  /api/v1/subscriptions/* → SUBSCRIPTION_SERVICE              │            │
│  │  /api/v1/notifications/* → NOTIFICATION_SERVICE              │            │
│  │  /api/v1/ocr/*     → OCR_SERVICE                             │            │
│  │  /api/v1/ai/*      → AI_SERVICE                              │            │
│  └──────────────────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                          TCP Transport (Internal)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │           │           │           │           │       │
        ▼           ▼           ▼           ▼           ▼       ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ...
   │  Auth   │ │ Expense │ │ Budget  │ │  Blog   │ │  Sub    │
   │ Service │ │ Service │ │ Service │ │ Service │ │ Service │
   │  :3001  │ │  :3002  │ │  :3003  │ │  :3004  │ │  :3005  │
   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │           │           │
        └───────────┴───────────┴─────┬─────┴───────────┘
                                      │
                              ┌───────┴───────┐
                              │   Database    │
                              │  (PostgreSQL) │
                              └───────────────┘
```

---

## 2. Phân Tích Hiện Trạng

### 2.1 Trạng Thái Các Services

| Service              | Status         | Notes                       |
| -------------------- | -------------- | --------------------------- |
| auth-service         | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| expense-service      | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| budget-service       | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| blog-service         | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| subscription-service | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| notification-service | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| ocr-service          | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| ai-service           | ⚪ Boilerplate | Chỉ có Hello World endpoint |
| api-gateway          | ❌ Empty       | Chưa có code                |

### 2.2 Dependencies Hiện Tại

Tất cả services đang sử dụng:

- NestJS 11.0.1
- Express (platform-express)
- RxJS 7.8.1
- TypeScript 5.7.2

**Thiếu các packages quan trọng:**

- ❌ `@nestjs/microservices` - Cần cho TCP/message transport
- ❌ `@nestjs/config` - Environment configuration
- ❌ `@nestjs/swagger` - API documentation
- ❌ `@nestjs/jwt` - JWT handling
- ❌ `@nestjs/passport` - Authentication strategies

---

## 3. Thiết Kế API Gateway

### 3.1 Transport Protocol

**Lựa chọn: TCP Transport**

| Option     | Pros                               | Cons                             | Decision             |
| ---------- | ---------------------------------- | -------------------------------- | -------------------- |
| **TCP**    | Simple, low latency, native NestJS | No persistence, sync only        | ✅ **Chọn**          |
| HTTP Proxy | Familiar, easy debug               | Higher overhead, more complexity | ❌                   |
| RabbitMQ   | Reliable, async, persistence       | Complex setup, learning curve    | Future consideration |
| gRPC       | Type-safe, high performance        | Proto files overhead             | Future consideration |

### 3.2 API Design Principles

#### RESTful Conventions

```
# Resource naming
GET    /api/v1/expenses          # List expenses
POST   /api/v1/expenses          # Create expense
GET    /api/v1/expenses/:id      # Get single expense
PUT    /api/v1/expenses/:id      # Update expense
DELETE /api/v1/expenses/:id      # Delete expense

# Nested resources
GET    /api/v1/budgets/:id/expenses   # Expenses trong budget

# Actions
POST   /api/v1/ocr/scan              # Scan receipt
POST   /api/v1/ai/analyze            # Analyze spending
```

#### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-11T10:00:00Z",
    "requestId": "uuid"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  },
  "meta": {
    "timestamp": "2025-12-11T10:00:00Z",
    "requestId": "uuid"
  }
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.3 Message Patterns

Gateway sẽ communicate với services qua **MessagePattern**:

```typescript
// Gateway Controller
@Get('expenses')
async getExpenses(@Query() query: PaginationDto) {
  return this.expenseClient.send({ cmd: 'get_expenses' }, query);
}

// Expense Service Controller
@MessagePattern({ cmd: 'get_expenses' })
async getExpenses(query: PaginationDto) {
  return this.expenseService.findAll(query);
}
```

---

## 4. Kế Hoạch Triển Khai

### 4.1 Phase 1: Foundation (Week 1)

#### Task 1.1: Khởi tạo API Gateway Project

```bash
# Tạo NestJS project
nest new api-gateway --skip-git

# Install core dependencies
npm install @nestjs/microservices @nestjs/config @nestjs/swagger swagger-ui-express
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install class-validator class-transformer
npm install helmet compression
```

#### Task 1.2: Cấu hình cơ bản

- [ ] Setup `ConfigModule` với environment variables
- [ ] Cấu hình Swagger với Bearer auth
- [ ] Setup global pipes (ValidationPipe)
- [ ] Setup global filters (HttpExceptionFilter)
- [ ] Setup global interceptors (LoggingInterceptor, TransformInterceptor)

#### Task 1.3: Update tất cả Microservices

Mỗi service cần được update:

```typescript
// main.ts - Chuyển sang Hybrid Application
import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  // HTTP app (optional, for health checks)
  const app = await NestFactory.create(AppModule);

  // Microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: parseInt(process.env.TCP_PORT) || 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.HTTP_PORT || 4001); // HTTP port for health checks
}
bootstrap();
```

### 4.2 Phase 2: Core Modules (Week 2)

#### Task 2.1: Auth Module

```typescript
// api-gateway/src/modules/auth/auth.module.ts
@Module({
  imports: [
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || "localhost",
          port: parseInt(process.env.AUTH_SERVICE_PORT) || 3001,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

**Endpoints:**
| Method | Path | Message Pattern | Description |
|--------|------|-----------------|-------------|
| POST | /auth/register | `auth.register` | Đăng ký user mới |
| POST | /auth/login | `auth.login` | Đăng nhập |
| POST | /auth/refresh | `auth.refresh` | Refresh token |
| POST | /auth/logout | `auth.logout` | Đăng xuất |
| GET | /auth/me | `auth.profile` | Lấy thông tin user |
| PUT | /auth/me | `auth.update_profile` | Cập nhật profile |
| POST | /auth/forgot-password | `auth.forgot_password` | Quên mật khẩu |
| POST | /auth/reset-password | `auth.reset_password` | Reset mật khẩu |

#### Task 2.2: Expense Module

**Endpoints:**
| Method | Path | Message Pattern | Auth | Description |
|--------|------|-----------------|------|-------------|
| GET | /expenses | `expense.find_all` | ✅ | List expenses |
| POST | /expenses | `expense.create` | ✅ | Create expense |
| GET | /expenses/:id | `expense.find_one` | ✅ | Get expense |
| PUT | /expenses/:id | `expense.update` | ✅ | Update expense |
| DELETE | /expenses/:id | `expense.delete` | ✅ | Delete expense |
| GET | /expenses/summary | `expense.summary` | ✅ | Get summary |
| GET | /expenses/categories | `expense.categories` | ✅ | List categories |

#### Task 2.3: Budget Module

**Endpoints:**
| Method | Path | Message Pattern | Auth | Description |
|--------|------|-----------------|------|-------------|
| GET | /budgets | `budget.find_all` | ✅ | List budgets |
| POST | /budgets | `budget.create` | ✅ | Create budget |
| GET | /budgets/:id | `budget.find_one` | ✅ | Get budget |
| PUT | /budgets/:id | `budget.update` | ✅ | Update budget |
| DELETE | /budgets/:id | `budget.delete` | ✅ | Delete budget |
| GET | /budgets/:id/progress | `budget.progress` | ✅ | Budget progress |

### 4.3 Phase 3: Advanced Modules (Week 3)

#### Task 3.1: Blog Module

| Method | Path         | Message Pattern     | Auth     | Description       |
| ------ | ------------ | ------------------- | -------- | ----------------- |
| GET    | /blogs       | `blog.find_all`     | ❌       | List public blogs |
| GET    | /blogs/:slug | `blog.find_by_slug` | ❌       | Get blog by slug  |
| POST   | /blogs       | `blog.create`       | ✅ Admin | Create blog       |
| PUT    | /blogs/:id   | `blog.update`       | ✅ Admin | Update blog       |
| DELETE | /blogs/:id   | `blog.delete`       | ✅ Admin | Delete blog       |

#### Task 3.2: Subscription Module

| Method | Path                     | Message Pattern | Auth | Description          |
| ------ | ------------------------ | --------------- | ---- | -------------------- |
| GET    | /subscriptions/plans     | `sub.plans`     | ❌   | List plans           |
| GET    | /subscriptions/current   | `sub.current`   | ✅   | Current subscription |
| POST   | /subscriptions/subscribe | `sub.subscribe` | ✅   | Subscribe to plan    |
| POST   | /subscriptions/cancel    | `sub.cancel`    | ✅   | Cancel subscription  |
| GET    | /subscriptions/invoices  | `sub.invoices`  | ✅   | Billing history      |

#### Task 3.3: Notification Module

| Method | Path                    | Message Pattern         | Auth | Description        |
| ------ | ----------------------- | ----------------------- | ---- | ------------------ |
| GET    | /notifications          | `notif.find_all`        | ✅   | List notifications |
| PUT    | /notifications/:id/read | `notif.mark_read`       | ✅   | Mark as read       |
| PUT    | /notifications/read-all | `notif.mark_all_read`   | ✅   | Mark all read      |
| GET    | /notifications/settings | `notif.get_settings`    | ✅   | Get settings       |
| PUT    | /notifications/settings | `notif.update_settings` | ✅   | Update settings    |

#### Task 3.4: OCR Module

| Method | Path         | Message Pattern | Auth | Description        |
| ------ | ------------ | --------------- | ---- | ------------------ |
| POST   | /ocr/scan    | `ocr.scan`      | ✅   | Scan receipt image |
| GET    | /ocr/history | `ocr.history`   | ✅   | Scan history       |
| GET    | /ocr/:id     | `ocr.find_one`  | ✅   | Get scan result    |

#### Task 3.5: AI Module

| Method | Path                | Message Pattern      | Auth | Description             |
| ------ | ------------------- | -------------------- | ---- | ----------------------- |
| GET    | /ai/insights        | `ai.insights`        | ✅   | Spending insights       |
| GET    | /ai/predictions     | `ai.predictions`     | ✅   | Expense predictions     |
| GET    | /ai/recommendations | `ai.recommendations` | ✅   | Saving recommendations  |
| POST   | /ai/categorize      | `ai.categorize`      | ✅   | Auto-categorize expense |

### 4.4 Phase 4: Production Readiness (Week 4)

- [ ] Health checks cho tất cả services
- [ ] Circuit breaker pattern
- [ ] Request timeout handling
- [ ] Retry logic
- [ ] Metrics collection (Prometheus)
- [ ] Distributed tracing (Jaeger/Zipkin)
- [ ] API versioning strategy
- [ ] Rate limiting per user/IP

---

## 5. Chi Tiết Các Module

### 5.1 Module Structure Template

```
src/modules/{module-name}/
├── {module-name}.module.ts      # Module definition
├── {module-name}.controller.ts  # HTTP endpoints
├── {module-name}.service.ts     # Business logic (optional)
├── dto/
│   ├── create-{entity}.dto.ts   # Create DTO
│   ├── update-{entity}.dto.ts   # Update DTO
│   └── {entity}-query.dto.ts    # Query/filter DTO
└── interfaces/
    └── {entity}.interface.ts    # Type definitions
```

### 5.2 DTO Validation Example

```typescript
// dto/create-expense.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateExpenseDto {
  @ApiProperty({ example: "Coffee", description: "Expense description" })
  @IsString()
  description: string;

  @ApiProperty({ example: 50000, description: "Amount in VND" })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: "food", description: "Category slug" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: "2025-12-11", description: "Expense date" })
  @IsDateString()
  date: string;
}
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication Guard

```typescript
// common/guards/auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authClient: ClientProxy,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check @Public() decorator
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler()
    );
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    try {
      const user = await firstValueFrom(
        this.authClient.send({ cmd: "auth.verify_token" }, { token })
      );
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
```

### 6.2 Rate Limiting

```typescript
// Sử dụng @nestjs/throttler
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,    // 1 second
        limit: 3,     // 3 requests
      },
      {
        name: 'medium',
        ttl: 10000,   // 10 seconds
        limit: 20,    // 20 requests
      },
      {
        name: 'long',
        ttl: 60000,   // 1 minute
        limit: 100,   // 100 requests
      },
    ]),
  ],
})
```

### 6.3 Logging Interceptor

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const requestId = uuidv4();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        this.logger.log(`[${requestId}] ${method} ${url} - ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[${requestId}] ${method} ${url} - ${duration}ms - ${error.message}`
        );
        throw error;
      })
    );
  }
}
```

### 6.4 Exception Filter

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(status),
        message,
        path: request.url,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers["x-request-id"],
      },
    });
  }
}
```

---

## 7. Deployment Strategy

### 7.1 Docker Configuration

```dockerfile
# api-gateway/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main"]
```

### 7.2 Docker Compose (Development)

```yaml
# deployment/docker-compose.yml
version: "3.8"

services:
  api-gateway:
    build: ../api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - AUTH_SERVICE_HOST=auth-service
      - AUTH_SERVICE_PORT=3001
      # ... other services
    depends_on:
      - auth-service
      - expense-service
      - budget-service
      # ...

  auth-service:
    build: ../auth-service
    ports:
      - "3001:3001"
      - "4001:4001"
    environment:
      - TCP_PORT=3001
      - HTTP_PORT=4001
      - DATABASE_URL=postgres://...

  expense-service:
    build: ../expense-service
    ports:
      - "3002:3002"
      - "4002:4002"
    environment:
      - TCP_PORT=3002
      - HTTP_PORT=4002

  # ... other services

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=fepa

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 7.3 Health Checks

```typescript
// Mỗi service expose health endpoint
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("ready")
  ready() {
    // Check all downstream services
    return {
      status: "ready",
      services: {
        auth: "connected",
        expense: "connected",
        // ...
      },
    };
  }
}
```

---

## 8. Monitoring & Logging

### 8.1 Metrics (Prometheus)

```typescript
// Sử dụng @willsoto/nestjs-prometheus
@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
    }),
  ],
})

// Custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});
```

### 8.2 Distributed Tracing

```typescript
// Sử dụng OpenTelemetry
import { NodeSDK } from "@opentelemetry/sdk-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: "http://jaeger:14268/api/traces",
  }),
  serviceName: "api-gateway",
});
```

### 8.3 Logging Strategy

| Level | Use Case                               |
| ----- | -------------------------------------- |
| ERROR | Unhandled exceptions, service failures |
| WARN  | Deprecated usage, performance issues   |
| INFO  | Request/response logs, business events |
| DEBUG | Detailed debugging (dev only)          |

---

## 📎 Appendix

### A. Checklist Triển Khai

#### Phase 1 - Foundation

- [ ] Khởi tạo api-gateway project
- [ ] Install dependencies
- [ ] Setup ConfigModule
- [ ] Setup Swagger
- [ ] Setup global pipes/filters/interceptors
- [ ] Update auth-service thành hybrid app
- [ ] Update expense-service thành hybrid app
- [ ] Update budget-service thành hybrid app
- [ ] Update blog-service thành hybrid app
- [ ] Update subscription-service thành hybrid app
- [ ] Update notification-service thành hybrid app
- [ ] Update ocr-service thành hybrid app
- [ ] Update ai-service thành hybrid app

#### Phase 2 - Core Modules

- [ ] Implement AuthModule + Controller
- [ ] Implement ExpenseModule + Controller
- [ ] Implement BudgetModule + Controller
- [ ] Test inter-service communication

#### Phase 3 - Advanced Modules

- [ ] Implement BlogModule
- [ ] Implement SubscriptionModule
- [ ] Implement NotificationModule
- [ ] Implement OcrModule
- [ ] Implement AiModule

#### Phase 4 - Production Readiness

- [ ] Health checks
- [ ] Circuit breaker
- [ ] Rate limiting
- [ ] Metrics/monitoring
- [ ] Docker/docker-compose
- [ ] Documentation hoàn chỉnh

### B. References

- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/basics)
- [NestJS TCP Transport](https://docs.nestjs.com/microservices/tcp)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)

---

_Document Version: 1.0_  
_Last Updated: December 11, 2025_  
_Author: FEPA Development Team_
