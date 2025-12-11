# FEPA API Gateway

> Entry point duy nhất cho hệ thống FEPA Microservices

## 📋 Tổng Quan

API Gateway đóng vai trò là **single entry point** cho tất cả client requests, chịu trách nhiệm:

- **Routing**: Điều hướng requests đến đúng microservice
- **Authentication**: Xác thực JWT tokens trước khi forward requests
- **Rate Limiting**: Giới hạn số lượng requests từ mỗi client
- **Load Balancing**: Phân tải giữa các instances của service
- **API Documentation**: Cung cấp Swagger UI cho toàn bộ API

## 🏗️ Kiến Trúc Tổng Quan

```
                    ┌─────────────────┐
                    │     Clients     │
                    │  (Web/Mobile)   │
                    └────────┬────────┘
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Port 3000)   │
                    └────────┬────────┘
                             │ TCP Transport
        ┌────────────────────┼────────────────────┐
        │           │        │        │           │
        ▼           ▼        ▼        ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌───┐ ┌─────────┐ ┌─────────┐
   │  Auth   │ │ Expense │ │...│ │   OCR   │ │   AI    │
   │ :3001   │ │ :3002   │ │   │ │ :3007   │ │ :3008   │
   └─────────┘ └─────────┘ └───┘ └─────────┘ └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose (optional, cho local development)

### Installation

```bash
# Clone và install dependencies
cd api-gateway
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev
```

### Chạy toàn bộ hệ thống (Docker)

```bash
cd deployment
docker-compose up -d
```

## 📁 Cấu Trúc Thư Mục

```
api-gateway/
├── src/
│   ├── main.ts                      # Bootstrap application
│   ├── app.module.ts                # Root module
│   ├── common/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts        # JWT authentication guard
│   │   │   └── rate-limit.guard.ts  # Rate limiting guard
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── decorators/
│   │       └── public.decorator.ts  # Skip auth cho public routes
│   ├── config/
│   │   ├── configuration.ts         # Environment config
│   │   └── services.config.ts       # Microservices connection config
│   └── modules/
│       ├── auth/                    # Proxy to auth-service
│       ├── expenses/                # Proxy to expense-service
│       ├── budgets/                 # Proxy to budget-service
│       ├── blogs/                   # Proxy to blog-service
│       ├── subscriptions/           # Proxy to subscription-service
│       ├── notifications/           # Proxy to notification-service
│       ├── ocr/                     # Proxy to ocr-service
│       └── ai/                      # Proxy to ai-service
├── test/
├── docs/
│   └── ARCHITECTURE.md              # Chi tiết kiến trúc
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Port Allocation

| Service              | Port | Description                    |
| -------------------- | ---- | ------------------------------ |
| api-gateway          | 3000 | Public HTTP endpoint           |
| auth-service         | 3001 | Authentication & Authorization |
| expense-service      | 3002 | Expense management             |
| budget-service       | 3003 | Budget tracking                |
| blog-service         | 3004 | Blog/content management        |
| subscription-service | 3005 | Subscription & billing         |
| notification-service | 3006 | Push/email notifications       |
| ocr-service          | 3007 | Receipt OCR processing         |
| ai-service           | 3008 | AI/ML features                 |

## 🔐 Authentication Flow

```
Client                Gateway              Auth Service
  │                      │                      │
  │── POST /auth/login ──▶                      │
  │                      │── validate user ────▶│
  │                      │◀── JWT token ────────│
  │◀── { token } ────────│                      │
  │                      │                      │
  │── GET /expenses ─────▶                      │
  │   (Bearer token)     │── verify token ─────▶│
  │                      │◀── { valid, user } ──│
  │                      │                      │
  │                      │── forward request ──▶│ Expense Service
  │◀── { expenses } ─────│◀── { data } ────────│
```

## 📚 API Documentation

Sau khi start server, truy cập Swagger UI tại:

```
http://localhost:3000/docs
```

## 🛠️ Development

### Scripts

```bash
# Development với hot-reload
npm run start:dev

# Build production
npm run build

# Run production
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint
```

### Environment Variables

| Variable            | Default     | Description                     |
| ------------------- | ----------- | ------------------------------- |
| `PORT`              | 3000        | Gateway HTTP port               |
| `NODE_ENV`          | development | Environment mode                |
| `JWT_SECRET`        | -           | Secret key for JWT verification |
| `AUTH_SERVICE_HOST` | localhost   | Auth service hostname           |
| `AUTH_SERVICE_PORT` | 3001        | Auth service port               |
| ...                 | ...         | (Tương tự cho các service khác) |

## 📖 Documentation

- [Chi tiết Kiến trúc](./docs/ARCHITECTURE.md)
- [API Reference](http://localhost:3000/docs) (Swagger)

## 🤝 Contributing

1. Tạo feature branch từ `develop`
2. Commit changes với conventional commits
3. Tạo Pull Request

## 📄 License

Private - FEPA Team
