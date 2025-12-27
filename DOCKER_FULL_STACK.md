# API Gateway + Auth Service - Docker Setup

## 🎯 2 Options để chạy

### **Option 1: Full Stack Docker** (Khuyến nghị - Đơn giản nhất)

Chạy tất cả trong Docker: MongoDB + Auth Service + API Gateway + RabbitMQ

```powershell
cd api-gateway

# Use full docker-compose
docker-compose -f docker-compose.full.yml up -d

# Wait for services
Start-Sleep -Seconds 20

# Check status
docker-compose -f docker-compose.full.yml ps
```

**Services Running**:
- MongoDB (27017)
- PostgreSQL (5432) 
- RabbitMQ (5672, 15672)
- Auth Service (3001)
- API Gateway (3000)

---

### **Option 2: Hybrid** (Flexible)

MongoDB + RabbitMQ trong Docker, Auth Service + API Gateway chạy local

```powershell
# Terminal 1: Start infrastructure
cd deployment
docker-compose up -d mongodb rabbitmq

# Terminal 2: Auth Service
cd auth-service
npm run start:dev

# Terminal 3: API Gateway
cd api-gateway
npm run start:dev
```

---

## 🚀 Quick Start (Option 1 - Full Docker)

### 1. Stop expense-service containers (tránh conflict)

```powershell
cd expense-service
docker-compose down
```

### 2. Start Full Stack

```powershell
cd ..\api-gateway
docker-compose -f docker-compose.full.yml up -d
Start-Sleep -Seconds 20
docker-compose -f docker-compose.full.yml ps
```

### 3. Start Expense Service (connect to existing network)

Update `expense-service/docker-compose.yml`:

```yaml
networks:
  fepa-network:
    external: true  # Use existing network from api-gateway
```

Then:
```powershell
cd ..\expense-service
docker-compose up -d
docker-compose exec expense-service npx prisma db push
```

### 4. Test in Postman

**Register User**:
```
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**Login**:
```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Create Expense**:
```
POST http://localhost:3000/api/v1/expenses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "description": "Coffee",
  "amount": 5.50,
  "spentAt": "2025-12-27"
}
```

---

## 🔧 Management

### View Logs
```powershell
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service
docker-compose -f docker-compose.full.yml logs -f api-gateway
docker-compose -f docker-compose.full.yml logs -f auth-service
```

### Stop All
```powershell
docker-compose -f docker-compose.full.yml down
```

### Clean (delete data)
```powershell
docker-compose -f docker-compose.full.yml down -v
```

---

## 🗄️ Database Access

### MongoDB (Auth Service)
```powershell
docker exec -it fepa-mongodb mongosh -u fepa -p fepa123 --authenticationDatabase admin

# In mongosh:
use fepa_auth
show collections
db.users.find()
```

### PostgreSQL (Microservices)
```powershell
docker exec -it fepa-postgres psql -U fepa -d fepa_expense

# In psql:
\dt
SELECT * FROM "Expense";
```

---

## 🌐 Access Points

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **RabbitMQ UI**: http://localhost:15672 (fepa/fepa123)
- **Expense Service**: http://localhost:3002 (RabbitMQ only)

---

## 🐛 Troubleshooting

### Port Conflicts

If ports are already in use:

```powershell
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :27017

# Kill process or change ports in docker-compose.full.yml
```

### Container Won't Start

```powershell
# Check logs
docker-compose -f docker-compose.full.yml logs auth-service

# Rebuild
docker-compose -f docker-compose.full.yml up -d --build
```

### Network Issues

```powershell
# Recreate network
docker network rm fepa-network
docker-compose -f docker-compose.full.yml up -d
```

---

## 📊 Architecture

```
Client (Postman)
    ↓
API Gateway (3000)
    ├── Auth Service (3001) → MongoDB (27017)
    └── RabbitMQ (5672)
            ├── Expense Service (3002) → PostgreSQL (5432)
            ├── Budget Service (3003) → PostgreSQL (5432)
            └── OCR Service (3007) → PostgreSQL (5432)
```

---

## ✅ Complete Workflow

```powershell
# 1. Start API Gateway + Auth Service + Infrastructure
cd api-gateway
docker-compose -f docker-compose.full.yml up -d
Start-Sleep -Seconds 20

# 2. Start Expense Service (reuse network)
cd ..\expense-service
# Edit docker-compose.yml: set network to external
docker-compose up -d
docker-compose exec expense-service npx prisma db push

# 3. Test in Postman
# - Register user
# - Login
# - Create expense
# - Get expenses

# 4. View logs
cd ..\api-gateway
docker-compose -f docker-compose.full.yml logs -f
```
