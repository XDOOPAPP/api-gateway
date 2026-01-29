import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class OcrUploadService {
    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB for images
    private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    constructor(private configService: ConfigService) {
        // Cấu hình Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
            );
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File too large. Max size: ${this.maxFileSize / 1024 / 1024}MB`,
            );
        }
    }

    async saveFile(file: Express.Multer.File): Promise<string> {
        this.validateFile(file);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'fepa/ocr',
                    resource_type: 'image',
                },
                (error, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(new BadRequestException(`Upload failed: ${error.message}`));
                    } else if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(new BadRequestException('Upload failed: No result'));
                    }
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    /**
     * Cloudinary URL đã là URL tuyệt đối, không cần convert
     * Giữ lại method này để tương thích với code cũ
     */
    getAbsoluteUrl(cloudinaryUrl: string): string {
        return cloudinaryUrl;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extract public_id from Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/fepa/ocr/filename.jpg
            const matches = fileUrl.match(/\/fepa\/ocr\/([^.]+)/);
            if (matches && matches[1]) {
                const publicId = `fepa/ocr/${matches[1]}`;
                await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
        }
    }
}
