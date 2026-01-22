import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FcmTokenDto {
    @ApiProperty({
        description: 'FCM token of the user',
        example: 'd_m8...:APA91b...',
    })
    @IsNotEmpty()
    @IsString()
    fcmToken: string;
}
