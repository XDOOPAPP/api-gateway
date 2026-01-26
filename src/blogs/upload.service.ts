import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BlogUploadService {
    private readonly uploadDir: string;
    private readonly maxFileSize = 5 * 1024 * 1024; // 5MB for blog images
    private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    constructor(private configService: ConfigService) {
        // Separate directory for blog uploads
        this.uploadDir = path.join(
            this.configService.get('UPLOAD_DIR') || '/app/uploads',
            'blog'
        );
        this.ensureUploadDir();
    }

    private ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
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

    saveFile(file: Express.Multer.File): string {
        this.validateFile(file);

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.originalname);
        const filename = `${timestamp}-${randomString}${ext}`;
        const filepath = path.join(this.uploadDir, filename);

        fs.writeFileSync(filepath, file.buffer);

        // Return URL path that will be accessible via static serving
        return `/uploads/blog/${filename}`;
    }

    saveFiles(files: Express.Multer.File[]): string[] {
        return files.map(file => this.saveFile(file));
    }

    deleteFile(fileUrl: string): void {
        try {
            // Extract filename from URL (e.g., /uploads/blog/123-abc.jpg -> 123-abc.jpg)
            const filename = fileUrl.split('/').pop();
            if (!filename) return;

            const filepath = path.join(this.uploadDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    deleteFiles(fileUrls: string[]): void {
        fileUrls.forEach((url) => this.deleteFile(url));
    }
}
