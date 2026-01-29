# Hướng dẫn Upload ảnh với Cloudinary

> **Dành cho Mobile Developer** - Cập nhật: Tháng 1/2026

## Tổng quan

Hệ thống đã chuyển từ lưu ảnh local sang **Cloudinary** (cloud storage). Điều này giúp:
- Ảnh không bị mất khi restart server
- Tải ảnh nhanh hơn qua CDN toàn cầu
- URL ảnh là HTTPS đầy đủ, có thể dùng trực tiếp

---

## 1. Upload ảnh cho Blog

### Endpoint

```
POST /blogs/upload/single    # Upload 1 ảnh
POST /blogs/upload/multiple  # Upload nhiều ảnh (tối đa 10)
```

### Headers

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request

**Upload 1 ảnh:**
```
Key: file
Value: <file ảnh>
```

**Upload nhiều ảnh:**
```
Key: files
Value: <file ảnh 1>
Value: <file ảnh 2>
...
```

### Response

**Upload 1 ảnh:**
```json
{
  "url": "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/1738192837-abc123.jpg"
}
```

**Upload nhiều ảnh:**
```json
{
  "urls": [
    "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/1738192837-abc123.jpg",
    "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/1738192838-def456.jpg"
  ]
}
```

### Giới hạn

| Loại | Giá trị |
|------|---------|
| Kích thước tối đa | 5MB / ảnh |
| Định dạng cho phép | JPEG, JPG, PNG, GIF, WEBP |
| Số lượng tối đa (multiple) | 10 ảnh / request |

### Ví dụ React Native

```typescript
import ImagePicker from 'react-native-image-picker';

const uploadBlogImage = async (accessToken: string) => {
  // 1. Chọn ảnh
  const result = await ImagePicker.launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
  });

  if (!result.assets?.[0]) return null;

  const image = result.assets[0];

  // 2. Tạo FormData
  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'photo.jpg',
  });

  // 3. Upload
  const response = await fetch('https://api.fepa.vn/blogs/upload/single', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const data = await response.json();
  
  // 4. Trả về URL Cloudinary
  return data.url;
  // "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/abc123.jpg"
};
```

### Flow tạo Blog với ảnh

```typescript
const createBlogWithImages = async () => {
  // Bước 1: Upload ảnh trước
  const imageUrl1 = await uploadBlogImage(accessToken);
  const imageUrl2 = await uploadBlogImage(accessToken);

  // Bước 2: Tạo blog với URLs
  const response = await fetch('https://api.fepa.vn/blogs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Cách tiết kiệm tiền hiệu quả',
      content: 'Nội dung bài viết...',
      slug: 'cach-tiet-kiem-tien',
      images: [imageUrl1, imageUrl2],  // ← Dùng URLs từ Cloudinary
      status: 'draft',
    }),
  });

  return response.json();
};
```

---

## 2. Upload ảnh cho OCR (Quét hóa đơn)

### Endpoint

```
POST /ocr/scan
```

### Headers

```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request

```
Key: file
Value: <file ảnh hóa đơn>
```

### Response

```json
{
  "success": true,
  "data": {
    "jobId": "cm5abc123xyz",
    "status": "processing",
    "message": "OCR job created, processing in background"
  }
}
```

### Giới hạn

| Loại | Giá trị |
|------|---------|
| Kích thước tối đa | 10MB / ảnh |
| Định dạng cho phép | JPEG, JPG, PNG, WEBP |

### Ví dụ React Native

```typescript
import { launchCamera } from 'react-native-image-picker';

const scanReceipt = async (accessToken: string) => {
  // 1. Chụp ảnh hóa đơn
  const result = await launchCamera({
    mediaType: 'photo',
    quality: 0.9,  // Chất lượng cao hơn để OCR chính xác
  });

  if (!result.assets?.[0]) return null;

  const image = result.assets[0];

  // 2. Tạo FormData
  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: 'receipt.jpg',
  });

  // 3. Gửi để scan
  const response = await fetch('https://api.fepa.vn/ocr/scan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const data = await response.json();
  
  // 4. Trả về jobId để theo dõi
  return data.data.jobId;
};
```

### Flow đầy đủ: Chụp → Scan → Lấy kết quả

```typescript
const fullOCRFlow = async () => {
  // Bước 1: Upload và scan
  const jobId = await scanReceipt(accessToken);
  console.log('Job created:', jobId);

  // Bước 2: Polling để lấy kết quả (mỗi 2 giây)
  const checkResult = async (): Promise<any> => {
    const response = await fetch(`https://api.fepa.vn/ocr/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    
    if (data.data.status === 'completed') {
      return data.data;
    } else if (data.data.status === 'failed') {
      throw new Error(data.data.errorMessage);
    } else {
      // Còn đang xử lý, đợi 2 giây rồi check lại
      await new Promise(resolve => setTimeout(resolve, 2000));
      return checkResult();
    }
  };

  const result = await checkResult();
  
  // Bước 3: Kết quả
  console.log('OCR Result:', result);
  /*
  {
    id: "cm5abc123xyz",
    imageUrl: "https://res.cloudinary.com/.../fepa/ocr/receipt.jpg",  ← Ảnh gốc
    status: "completed",
    extractedData: {
      merchantName: "Siêu thị Coopmart",
      totalAmount: 150000,
      date: "2026-01-28",
      items: [...]
    }
  }
  */

  // Bước 4: Tự động điền form tạo Expense
  navigation.navigate('CreateExpense', {
    prefillData: {
      description: result.extractedData.merchantName,
      amount: result.extractedData.totalAmount,
      date: result.extractedData.date,
      receiptUrl: result.imageUrl,
    },
  });
};
```

---

## 3. Hiển thị ảnh từ Cloudinary

### React Native Image

```tsx
import { Image } from 'react-native';

// URL từ API response
const imageUrl = "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/abc.jpg";

<Image 
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>
```

### FastImage (Khuyến nghị - có cache)

```bash
npm install react-native-fast-image
```

```tsx
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### Cloudinary URL Transformations (Bonus)

Cloudinary cho phép biến đổi ảnh qua URL. Thêm tham số vào URL:

```typescript
const originalUrl = "https://res.cloudinary.com/xxx/image/upload/v123/fepa/blogs/abc.jpg";

// Resize về 300x300
const thumbnailUrl = originalUrl.replace('/upload/', '/upload/w_300,h_300,c_fill/');

// Giảm chất lượng (tiết kiệm data)
const lowQualityUrl = originalUrl.replace('/upload/', '/upload/q_60/');

// Cả hai
const optimizedUrl = originalUrl.replace('/upload/', '/upload/w_300,h_300,c_fill,q_70/');
```

---

## 4. Xử lý lỗi

### Lỗi thường gặp

| Status Code | Lỗi | Giải pháp |
|-------------|-----|-----------|
| 400 | `No file provided` | Kiểm tra key form-data (`file` hoặc `files`) |
| 400 | `Invalid file type` | Chỉ chấp nhận JPEG, PNG, GIF, WEBP |
| 400 | `File too large` | Blog: max 5MB, OCR: max 10MB |
| 401 | `Unauthorized` | Token hết hạn, cần refresh |
| 500 | `Upload failed` | Lỗi Cloudinary, thử lại sau |

### Ví dụ xử lý lỗi

```typescript
const uploadWithErrorHandling = async (file: any) => {
  try {
    const response = await fetch('https://api.fepa.vn/blogs/upload/single', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          Alert.alert('Lỗi', error.message || 'File không hợp lệ');
          break;
        case 401:
          // Redirect to login
          navigation.navigate('Login');
          break;
        case 500:
          Alert.alert('Lỗi', 'Server đang bận, vui lòng thử lại');
          break;
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể kết nối server');
    return null;
  }
};
```

---

## 5. Checklist tích hợp

### Blog Upload
- [ ] Gọi `POST /blogs/upload/single` với `file` trong form-data
- [ ] Nhận URL từ response: `data.url`
- [ ] Dùng URL đó trong body khi tạo/update blog
- [ ] Hiển thị ảnh bằng `<Image source={{ uri: url }} />`

### OCR Scan
- [ ] Gọi `POST /ocr/scan` với ảnh hóa đơn
- [ ] Nhận `jobId` từ response
- [ ] Polling `GET /ocr/jobs/:jobId` để lấy kết quả
- [ ] Khi `status === 'completed'`, lấy `extractedData` để auto-fill form
- [ ] Lưu `imageUrl` làm receipt attachment cho Expense

---

## Liên hệ

Nếu gặp vấn đề, liên hệ Backend team:
- Kiểm tra token còn hạn không
- Kiểm tra file size và định dạng
- Gửi kèm request/response để debug
