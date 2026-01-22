import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    mixin,
    Type,
} from '@nestjs/common';
import { AuthClient } from '../../auth/auth.client.js';

export const FeatureGuard = (feature: string): Type<CanActivate> => {
    @Injectable()
    class FeatureGuardMixin implements CanActivate {
        constructor(private readonly authClient: AuthClient) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const user = request.user;

            if (!user || !user.userId) {
                return false;
            }

            // Check cache (which falls back to internal API if needed)
            const features = await this.authClient.getCachedFeatures(user.userId);

            if (!features || !features[feature]) {
                throw new ForbiddenException(
                    `Bạn không có quyền sử dụng tính năng ${feature}. Vui lòng đăng ký gói dịch vụ phù hợp.`,
                );
            }

            return true;
        }
    }

    return mixin(FeatureGuardMixin);
};
