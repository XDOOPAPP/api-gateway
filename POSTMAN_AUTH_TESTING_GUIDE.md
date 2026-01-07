# Hướng Dẫn Test Authentication với Postman

## 📋 Tổng Quan

Hướng dẫn này sẽ chỉ bạn cách test các API authentication trong hệ thống FEPA sử dụng Postman. API Gateway sẽ forward các request đến Auth Service.

## 🔗 Endpoint URLs

- **API Gateway**: `http://localhost:3000/api/v1`
- **Auth Service (Direct)**: `http://localhost:3001/api/v1/auth`

**Lưu ý**: Nên test qua API Gateway để đảm bảo integration hoạt động đúng.

## 🚀 Flow Authentication Hoàn Chỉnh

```
1. Register → Nhận OTP qua email
2. Verify OTP → Nhận Access Token + Refresh Token
3. Login → Nhận Access Token + Refresh Token mới
4. Get Profile → Sử dụng Access Token
5. Refresh Token → Lấy Access Token mới khi hết hạn
```

---

## 📝 Chi Tiết Các API Endpoints

### 1. Đăng Ký Tài Khoản (Register)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

**Response Success (200)**:
```json
{
  "message": "OTP sent to email. Please verify your account."
}
```

**Response Error (400)**:
```json
{
  "message": "Email already exists",
  "status": 400
}
```

**Lưu ý**: 
- Kiểm tra email để lấy mã OTP (6 chữ số)
- OTP có hiệu lực trong 5 phút

---

### 2. Xác Thực OTP (Verify OTP)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/verify-otp`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Response Success (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400)**:
```json
{
  "message": "Invalid or expired OTP",
  "status": 400
}
```

**Lưu ý**: 
- Lưu lại `accessToken` và `refreshToken` để sử dụng cho các request sau
- Access Token có hiệu lực 15 phút
- Refresh Token có hiệu lực 7 ngày

---

### 3. Gửi Lại OTP (Resend OTP)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/resend-otp`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com"
}
```

**Response Success (200)**:
```json
{
  "message": "OTP resent to email"
}
```

---

### 4. Đăng Nhập (Login)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response Success (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (401)**:
```json
{
  "message": "Invalid credentials",
  "status": 401
}
```

hoặc

```json
{
  "message": "Account not verified",
  "status": 401
}
```

---

### 5. Lấy Thông Tin Profile (Get Profile)

**Endpoint**: `GET http://localhost:3000/api/v1/auth/me`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "test@example.com",
  "fullName": "Nguyen Van A",
  "role": "USER"
}
```

**Response Error (401)**:
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Lưu ý**: 
- Thay `<access_token>` bằng token nhận được từ login hoặc verify-otp
- Đây là endpoint protected, bắt buộc phải có token

---

### 6. Refresh Access Token

**Endpoint**: `POST http://localhost:3000/api/v1/auth/refresh`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (401)**:
```json
{
  "message": "Invalid refresh token",
  "status": 401
}
```

---

### 7. Quên Mật Khẩu (Forgot Password)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/forgot-password`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com"
}
```

**Response Success (200)**:
```json
{
  "message": "OTP sent to email for password reset"
}
```

---

### 8. Reset Mật Khẩu (Reset Password)

**Endpoint**: `POST http://localhost:3000/api/v1/auth/reset-password`

**Headers**:
```
Content-Type: application/json
```

**Body (raw JSON)**:
```json
{
  "email": "test@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```

**Response Success (200)**:
```json
{
  "message": "Password reset successfully"
}
```

---

### 9. Verify Token

**Endpoint**: `POST http://localhost:3000/api/v1/auth/verify`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response Success (200)**:
```json
{
  "valid": true,
  "userId": "507f1f77bcf86cd799439011",
  "role": "USER"
}
```

---

## 🔧 Cách Setup Postman Collection

### Bước 1: Tạo Collection Mới

1. Mở Postman
2. Click **New** → **Collection**
3. Đặt tên: `FEPA Authentication`

### Bước 2: Tạo Environment Variables

1. Click **Environments** → **Create Environment**
2. Đặt tên: `FEPA Local`
3. Thêm các biến:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `access_token` | | |
| `refresh_token` | | |
| `test_email` | `test@example.com` | `test@example.com` |
| `test_password` | `password123` | `password123` |

### Bước 3: Tạo Requests

Tạo các request theo thứ tự sau:

#### 3.1. Register Request

- **Method**: POST
- **URL**: `{{base_url}}/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}",
  "fullName": "Test User"
}
```

#### 3.2. Verify OTP Request

- **Method**: POST
- **URL**: `{{base_url}}/auth/verify-otp`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "{{test_email}}",
  "otp": "123456"
}
```
- **Tests** (để tự động lưu tokens):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
}
```

#### 3.3. Login Request

- **Method**: POST
- **URL**: `{{base_url}}/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```
- **Tests**:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
    pm.environment.set("refresh_token", jsonData.refreshToken);
}
```

#### 3.4. Get Profile Request

- **Method**: GET
- **URL**: `{{base_url}}/auth/me`
- **Headers**: 
  - `Authorization: Bearer {{access_token}}`

#### 3.5. Refresh Token Request

- **Method**: POST
- **URL**: `{{base_url}}/auth/refresh`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "refreshToken": "{{refresh_token}}"
}
```
- **Tests**:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Đăng Ký và Xác Thực Tài Khoản Mới

1. **Register**: Gửi request đăng ký với email mới
2. **Check Email**: Lấy OTP từ email
3. **Verify OTP**: Xác thực OTP
4. **Get Profile**: Kiểm tra thông tin user với access token

### Scenario 2: Đăng Nhập với Tài Khoản Đã Tồn Tại

1. **Login**: Đăng nhập với email/password
2. **Get Profile**: Lấy thông tin profile
3. **Verify Token**: Kiểm tra token còn hiệu lực

### Scenario 3: Refresh Token Flow

1. **Login**: Đăng nhập để lấy tokens
2. **Wait**: Đợi access token hết hạn (15 phút) hoặc test ngay
3. **Refresh**: Sử dụng refresh token để lấy access token mới
4. **Get Profile**: Sử dụng access token mới

### Scenario 4: Reset Password

1. **Forgot Password**: Gửi request quên mật khẩu
2. **Check Email**: Lấy OTP từ email
3. **Reset Password**: Reset mật khẩu với OTP
4. **Login**: Đăng nhập với mật khẩu mới

### Scenario 5: Error Handling

1. **Invalid Credentials**: Login với password sai
2. **Expired OTP**: Verify với OTP đã hết hạn
3. **Invalid Token**: Get profile với token không hợp lệ
4. **Duplicate Email**: Register với email đã tồn tại

---

## 🔍 Debugging Tips

### 1. Kiểm tra Services Đang Chạy

```bash
# Kiểm tra API Gateway
curl http://localhost:3000/health

# Kiểm tra Auth Service
curl http://localhost:3001/api/v1/auth/health
```

### 2. Xem Logs

```bash
# API Gateway logs
docker logs -f fepa-api-gateway

# Auth Service logs
docker logs -f auth-service
```

### 3. Common Issues

#### Issue: "Cannot connect to service"
- **Giải pháp**: Kiểm tra services đang chạy với `docker ps`

#### Issue: "Email not sent"
- **Giải pháp**: Kiểm tra cấu hình email trong auth-service `.env`:
  - `EMAIL_USER`: Gmail address
  - `EMAIL_PASS`: App Password (không phải password thường)

#### Issue: "Invalid token"
- **Giải pháp**: 
  - Kiểm tra token có đúng format không
  - Kiểm tra token đã hết hạn chưa
  - Đảm bảo `JWT_SECRET` giống nhau giữa services

#### Issue: "CORS error"
- **Giải pháp**: API Gateway đã config CORS, nhưng nếu gặp lỗi, kiểm tra origin trong request

---

## 📊 Token Information

### Access Token
- **Thời hạn**: 15 phút
- **Sử dụng**: Gửi trong header `Authorization: Bearer <token>`
- **Payload**: `{ id, role }`
- **Stateless**: Không lưu trong database

### Refresh Token
- **Thời hạn**: 7 ngày
- **Sử dụng**: Gửi trong body để lấy access token mới
- **Lưu trữ**: Database (RefreshToken collection)
- **Multiple sessions**: User có thể có nhiều refresh tokens

---

## 🎯 Best Practices

1. **Luôn test qua API Gateway** (`localhost:3000`) thay vì direct call Auth Service
2. **Lưu tokens vào Environment Variables** để tái sử dụng
3. **Sử dụng Tests tab** trong Postman để tự động lưu tokens
4. **Tạo nhiều test users** với emails khác nhau
5. **Test cả success và error cases**
6. **Kiểm tra logs** khi có lỗi để debug

---

## 📚 Tài Liệu Tham Khảo

- [Auth Service README](../auth-service/README.md)
- [API Gateway README](./README.md)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)

---

## 🆘 Support

Nếu gặp vấn đề, kiểm tra:
1. Services đang chạy: `docker ps`
2. Logs: `docker logs -f <service-name>`
3. Environment variables trong `.env` files
4. Network connectivity giữa services

---

**Happy Testing! 🚀**
