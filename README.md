# API Gateway - Docker Compose

Docker Compose configuration để chạy API Gateway cùng với RabbitMQ.

## 📋 Yêu cầu

- Docker
- Docker Compose

## 🚀 Cách sử dụng

### 1. Development Mode (với hot reload)

```bash
# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env nếu cần
# nano .env

# Khởi động services
docker-compose up -d

# Xem logs
docker-compose logs -f api-gateway
```

**Lưu ý**: Trong development mode, code sẽ được mount vào container. Bạn cần uncomment dòng `command: npm run start:dev` trong docker-compose.yml để enable hot reload.

### 2. Production Mode

```bash
# Build và khởi động
docker-compose up -d --build

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f
```

## 🔧 Services

### API Gateway
- **URL**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/api/v1/health

### RabbitMQ
- **AMQP Port**: 5672
- **Management UI**: http://localhost:15672
- **Credentials**: 
  - Username: `fepa`
  - Password: `fepa123`

## 📝 Environment Variables

Tất cả environment variables được định nghĩa trong file `.env.example`. Copy và chỉnh sửa theo nhu cầu:

```bash
cp .env.example .env
```

### Các biến quan trọng:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Gateway port | `3000` |
| `NODE_ENV` | Environment mode | `production` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://fepa:fepa123@rabbitmq:5672` |
| `JWT_SECRET` | JWT secret key | `your-secret-key-change-in-production` |
| `JWT_EXPIRATION` | JWT token expiration | `24h` |
| `LOG_LEVEL` | Logging level | `debug` |

## 🛠️ Commands

### Khởi động services
```bash
docker-compose up -d
```

### Dừng services
```bash
docker-compose down
```

### Dừng và xóa volumes
```bash
docker-compose down -v
```

### Rebuild images
```bash
docker-compose up -d --build
```

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ API Gateway
docker-compose logs -f api-gateway

# Chỉ RabbitMQ
docker-compose logs -f rabbitmq
```

### Restart services
```bash
# Restart tất cả
docker-compose restart

# Restart API Gateway
docker-compose restart api-gateway
```

### Exec vào container
```bash
docker-compose exec api-gateway sh
```

## 🔍 Troubleshooting

### API Gateway không kết nối được RabbitMQ

**Triệu chứng**: Logs hiển thị lỗi connection refused

**Giải pháp**:
1. Kiểm tra RabbitMQ đã chạy chưa:
   ```bash
   docker-compose ps rabbitmq
   ```

2. Kiểm tra health check:
   ```bash
   docker-compose exec rabbitmq rabbitmq-diagnostics ping
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

### Port 3000 đã được sử dụng

**Giải pháp**: Thay đổi port trong file `.env`:
```env
PORT=3001
```

Sau đó restart:
```bash
docker-compose down
docker-compose up -d
```

### RabbitMQ Management UI không truy cập được

**Giải pháp**:
1. Kiểm tra RabbitMQ logs:
   ```bash
   docker-compose logs rabbitmq
   ```

2. Đảm bảo port 15672 không bị block bởi firewall

3. Truy cập: http://localhost:15672

## 🔐 Security Notes

### Production Deployment

Khi deploy production, **BẮT BUỘC** phải thay đổi:

1. **JWT_SECRET**: Tạo secret key mạnh
   ```bash
   # Generate random secret
   openssl rand -base64 32
   ```

2. **RabbitMQ Credentials**: Thay đổi username/password mặc định
   ```yaml
   environment:
     - RABBITMQ_DEFAULT_USER=your_username
     - RABBITMQ_DEFAULT_PASS=your_strong_password
   ```

3. **RABBITMQ_URL**: Cập nhật với credentials mới
   ```env
   RABBITMQ_URL=amqp://your_username:your_strong_password@rabbitmq:5672
   ```

## 📊 Monitoring

### Kiểm tra RabbitMQ Queues

1. Truy cập Management UI: http://localhost:15672
2. Login với credentials: `fepa` / `fepa123`
3. Vào tab **Queues** để xem:
   - `auth_queue`
   - `expense_queue`
   - `budget_queue`
   - `blog_queue`
   - `subscription_queue`
   - `notification_queue`
   - `ocr_queue`
   - `ai_queue`

### Health Checks

```bash
# API Gateway health
curl http://localhost:3000/api/v1/health

# RabbitMQ health
docker-compose exec rabbitmq rabbitmq-diagnostics check_running
```

## 🌐 Network

Services giao tiếp qua network `api-gateway-network`. Nếu bạn muốn kết nối với các microservices khác, thêm chúng vào cùng network:

```yaml
networks:
  api-gateway-network:
    external: true
```

## 📦 Volumes

- `rabbitmq_data`: Lưu trữ dữ liệu RabbitMQ (messages, queues, exchanges)

Để backup:
```bash
docker run --rm -v api-gateway_rabbitmq_data:/data -v $(pwd):/backup alpine tar czf /backup/rabbitmq-backup.tar.gz -C /data .
```

Để restore:
```bash
docker run --rm -v api-gateway_rabbitmq_data:/data -v $(pwd):/backup alpine tar xzf /backup/rabbitmq-backup.tar.gz -C /data
```

## 🔄 Development Workflow

### Enable Hot Reload

1. Uncomment dòng này trong `docker-compose.yml`:
   ```yaml
   command: npm run start:dev
   ```

2. Restart:
   ```bash
   docker-compose restart api-gateway
   ```

3. Code changes sẽ tự động reload

### Disable Hot Reload (Production)

Comment lại dòng `command: npm run start:dev` và restart.

## 📚 Tài liệu liên quan

- [RabbitMQ Migration Guide](../RABBITMQ_MIGRATION.md)
- [Install Dependencies Guide](../INSTALL_DEPENDENCIES.md)
- [NestJS Microservices Documentation](https://docs.nestjs.com/microservices/rabbitmq)
- [RabbitMQ Official Documentation](https://www.rabbitmq.com/documentation.html)
