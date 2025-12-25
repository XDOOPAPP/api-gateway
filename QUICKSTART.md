# 🚀 Quick Start - API Gateway

Hướng dẫn nhanh để chạy API Gateway với Docker Compose.

## ⚡ Chạy ngay (3 bước)

### 1️⃣ Tạo file .env
```bash
cp .env.example .env
```

### 2️⃣ Khởi động services
```bash
# Windows (PowerShell)
.\manage.ps1 up

# Linux/Mac (hoặc Windows với make)
make up

# Hoặc dùng docker-compose trực tiếp
docker-compose up -d
```

### 3️⃣ Kiểm tra
- **API Gateway**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **RabbitMQ UI**: http://localhost:15672 (login: `fepa` / `fepa123`)

## 🎯 Commands thường dùng

### Windows (PowerShell)
```powershell
# Xem tất cả commands
.\manage.ps1 help

# Khởi động
.\manage.ps1 up

# Xem logs
.\manage.ps1 logs

# Dừng
.\manage.ps1 down

# Kiểm tra health
.\manage.ps1 health

# Mở RabbitMQ UI
.\manage.ps1 rmq-ui
```

### Linux/Mac (Makefile)
```bash
# Xem tất cả commands
make help

# Khởi động
make up

# Xem logs
make logs

# Dừng
make down

# Kiểm tra health
make health
```

### Docker Compose (Universal)
```bash
# Khởi động
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 🔧 Development Mode

### Bật Hot Reload

1. Mở `docker-compose.yml`
2. Tìm dòng `# command: npm run start:dev`
3. Bỏ comment (xóa `#`)
4. Restart:
   ```bash
   # Windows
   .\manage.ps1 restart
   
   # Linux/Mac
   make restart
   ```

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng?
Sửa trong `.env`:
```env
PORT=3001
```

### RabbitMQ không kết nối được?
```bash
# Kiểm tra logs
docker-compose logs rabbitmq

# Restart
docker-compose restart rabbitmq
```

### API Gateway lỗi?
```bash
# Xem logs
docker-compose logs api-gateway

# Rebuild
docker-compose up -d --build
```

## 📚 Tài liệu đầy đủ

Xem [README.md](./README.md) để biết thêm chi tiết.

## 🎉 Xong!

API Gateway của bạn đã sẵn sàng! Bây giờ bạn có thể:

1. ✅ Gọi API qua http://localhost:3000
2. ✅ Xem docs tại http://localhost:3000/docs
3. ✅ Monitor RabbitMQ tại http://localhost:15672
4. ✅ Kết nối các microservices khác vào cùng RabbitMQ

---

**Cần giúp đỡ?** Xem [README.md](./README.md) hoặc [RABBITMQ_MIGRATION.md](../RABBITMQ_MIGRATION.md)
