# FEPA API Gateway

API Gateway cho hệ thống FEPA Microservices, xây dựng bằng NestJS.

## Giới Thiệu

API Gateway là điểm truy cập duy nhất cho các client, đứng giữa client và các microservices. Gateway này:

- Định tuyến requests đến các services phù hợp
- Xác thực và phân quyền (JWT)
- Log tất cả requests/responses
- Xử lý lỗi tập trung
- Validate input data

## Cài Đặt

```bash
npm install
```

## Cấu Hình

1. Copy `.env.example` thành `.env`:

   ```bash
   cp .env.example .env
   ```

2. Chỉnh sửa `.env` theo cần thiết (mặc định localhost)

3. Xem [CONFIG.md](./CONFIG.md) để chi tiết cấu hình

## Chạy Development

```bash
npm run start:dev
```

Ứng dụng sẽ chạy trên:

- **API Gateway**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/api/v1/health

## Chạy Production

```bash
npm run build
npm run start:prod
```

## Scripts Khác

```bash
npm run lint       # ESLint check
npm run format     # Prettier format
npm test           # Run tests
npm run test:e2e   # E2E tests
```

## Kiến Trúc

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│    API Gateway (Port 3000)      │
│  - Authentication               │
│  - Rate Limiting                │
│  - Request/Response Transform   │
│  - Logging                      │
└────────────────────┬────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │ Auth   │  │Expense │  │Budget  │
    │Service │  │Service │  │Service │
    │:3001   │  │:3002   │  │:3003   │
    └────────┘  └────────┘  └────────┘
```

## API Endpoints

### Health Check

```http
GET /api/v1/health
```

### Authentication (từ Auth Service)

```http
POST /api/v1/auth/login
POST /api/v1/auth/register
GET /api/v1/auth/me
PUT /api/v1/auth/me
```

### Expenses (từ Expense Service)

```http
GET /api/v1/expenses
POST /api/v1/expenses
GET /api/v1/expenses/:id
PUT /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
```

### Budgets (từ Budget Service)

```http
GET /api/v1/budgets
POST /api/v1/budgets
GET /api/v1/budgets/:id
PUT /api/v1/budgets/:id
DELETE /api/v1/budgets/:id
```

### Swagger Documentation

```http
GET /docs
```

## Environment Variables

Xem `.env.example` để biết tất cả biến:

| Variable          | Mô Tả                   | Default         |
| ----------------- | ----------------------- | --------------- |
| PORT              | Cổng API Gateway        | 3000            |
| NODE_ENV          | Môi trường              | development     |
| AUTH_SERVICE_HOST | Host Auth Service       | localhost       |
| AUTH_SERVICE_PORT | Port Auth Service (TCP) | 3001            |
| JWT_SECRET        | Secret key JWT          | your-secret-key |
| LOG_LEVEL         | Mức logging             | debug           |

## Ghi Chú Kỹ Thuật

- **Transport**: TCP (cho tốc độ cao, độ trễ thấp)
- **Framework**: NestJS 11
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, JWT authentication

## Mở Rộng Thêm Modules

Tạo module mới (ví dụ Blog Service):

```bash
npm run nest g module modules/blog
npm run nest g controller modules/blog
```

Xem [CONFIG.md](./CONFIG.md) để chi tiết thêm service mới.

## Troubleshooting

### Lỗi kết nối services

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Giải pháp**: Chắc chắn các microservices đang chạy trên TCP ports đúng

```bash
# Terminal 1: Auth Service
cd auth-service
npm run start:dev

# Terminal 2: Expense Service
cd expense-service
npm run start:dev

# Terminal 3: API Gateway
cd api-gateway
npm run start:dev
```

### Lỗi validation

Chắc chắn DTOs có `@IsString()`, `@IsNumber()`, v.v. từ `class-validator`

### Port đã sử dụng

Thay đổi PORT trong `.env`:

```
PORT=3001
```

## Liên Hệ & Support

Xem [docs/ARCHITECTURE.md](../api-gateway/docs/ARCHITECTURE.md) để chi tiết thiết kế hệ thống.
