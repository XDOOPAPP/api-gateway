# OCR Service - Upload & Polling Guide

## Quy trình xử lý OCR với File Upload

```
┌─────────────────┐
│   Mobile App    │
│  (Chụp ảnh)     │
└────────┬────────┘
         │ POST multipart/form-data
         │ /api/v1/ocr/scan
         ▼
┌─────────────────┐
│  API Gateway    │
│  - Nhận file    │
│  - Lưu vào      │
│    /uploads/ocr │
│  - Tạo URL      │
└────────┬────────┘
         │ RabbitMQ: ocr.scan
         │ { fileUrl, userId }
         ▼
┌─────────────────┐
│   OCR Service   │
│  - Download img │
│  - Detect QR    │
│  - Fallback OCR │
│  - Parse data   │
└────────┬────────┘
         │ Update DB: status = completed
         │ RabbitMQ: ocr.completed
         ▼
┌─────────────────┐
│ Expense Service │
│  Create expense │
└─────────────────┘
```

## API Endpoints

### 1. Upload & Scan Invoice

**POST** `/api/v1/ocr/scan`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
file: <binary image file>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-uuid",
  "status": "queued",
  "fileUrl": "http://api-gateway:3000/uploads/ocr/1738000000-abc123.jpg",
  "resultJson": null,
  "createdAt": "2026-01-26T10:00:00.000Z",
  "completedAt": null
}
```

### 2. Polling Job Status (Mỗi 2 giây)

**GET** `/api/v1/ocr/jobs/:jobId`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (Processing):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "fileUrl": "http://api-gateway:3000/uploads/ocr/xxx.jpg",
  "resultJson": null,
  "createdAt": "2026-01-26T10:00:00.000Z",
  "completedAt": null
}
```

**Response (Completed with QR):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "fileUrl": "http://api-gateway:3000/uploads/ocr/xxx.jpg",
  "resultJson": {
    "rawText": "pipe-separated QR data",
    "confidence": 98,
    "hasQrCode": true,
    "qrData": {
      "rawData": "...",
      "parsedData": {
        "invoiceNumber": "0001234",
        "sellerName": "CÔNG TY ABC",
        "totalPayment": 150000
      }
    },
    "expenseData": {
      "amount": 150000,
      "description": "CÔNG TY ABC - 0001234",
      "spentAt": "2026-01-26T00:00:00.000Z",
      "category": null,
      "confidence": 98,
      "source": "qr"
    }
  },
  "createdAt": "2026-01-26T10:00:00.000Z",
  "completedAt": "2026-01-26T10:00:05.000Z"
}
```

**Response (Failed):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "fileUrl": "http://api-gateway:3000/uploads/ocr/xxx.jpg",
  "resultJson": null,
  "errorMessage": "Failed to download image: Connection timeout",
  "createdAt": "2026-01-26T10:00:00.000Z",
  "completedAt": "2026-01-26T10:00:30.000Z"
}
```

## Frontend Implementation (React Native Example)

```typescript
import { useState, useEffect } from 'react';

const OCRScanner = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [result, setResult] = useState<any>(null);

  // 1. Upload image
  const scanInvoice = async (imageUri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'invoice.jpg',
    } as any);

    const response = await fetch('http://api.fepa.local/api/v1/ocr/scan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const job = await response.json();
    setJobId(job.id);
    setStatus(job.status);
  };

  // 2. Polling every 2 seconds
  useEffect(() => {
    if (!jobId || status === 'completed' || status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      const response = await fetch(
        `http://api.fepa.local/api/v1/ocr/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const job = await response.json();
      setStatus(job.status);

      if (job.status === 'completed') {
        setResult(job.resultJson);
        clearInterval(interval);
      } else if (job.status === 'failed') {
        alert(`Error: ${job.errorMessage}`);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status]);

  return (
    <View>
      {status === 'idle' && <Button onPress={openCamera} />}
      {(status === 'queued' || status === 'processing') && (
        <ActivityIndicator />
      )}
      {status === 'completed' && result && (
        <View>
          <Text>Amount: {result.expenseData.amount} VND</Text>
          <Text>Description: {result.expenseData.description}</Text>
          <Text>Source: {result.expenseData.source}</Text>
        </View>
      )}
    </View>
  );
};
```

## Environment Variables

### API Gateway (.env)

```bash
# Upload directory (Docker volume)
UPLOAD_DIR=/app/uploads

# API Gateway URL for internal service communication
# In Docker: use service name
API_GATEWAY_URL=http://api-gateway:3000

# In local development: use localhost
# API_GATEWAY_URL=http://localhost:3000
```

### Docker Compose Volume

Đảm bảo `/app/uploads` được mount trong docker-compose.yml:

```yaml
services:
  api-gateway:
    volumes:
      - ./uploads:/app/uploads
    environment:
      - UPLOAD_DIR=/app/uploads
      - API_GATEWAY_URL=http://api-gateway:3000

  ocr-service:
    # Không cần volume vì OCR service download từ API Gateway
```

## File Validation

- **Max size:** 10MB
- **Allowed types:** JPEG, PNG, WEBP
- **Auto cleanup:** Có thể implement cron job để xóa file cũ hơn 7 ngày

## Status Flow

```
idle → queued → processing → completed/failed
```

- **queued**: Job đã tạo, chờ xử lý
- **processing**: Đang tải ảnh và chạy OCR/QR detection
- **completed**: Thành công, có `resultJson`
- **failed**: Lỗi, có `errorMessage`

## Notes

1. **Polling interval:** 2 giây là hợp lý (không quá nhanh gây load, không quá chậm gây trải nghiệm kém)

2. **Timeout:** Nếu sau 30 giây vẫn không completed → hiển thị lỗi timeout

3. **Cleanup:** Xem xét thêm API để xóa file sau khi xử lý xong (hoặc cron job)

4. **Security:** File chỉ accessible qua authenticated request (có thể thêm middleware check JWT)
