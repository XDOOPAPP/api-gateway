import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const requestId = headers['x-request-id'] || uuidv4();
    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `[${requestId}] ${method} ${url} | Status: 200 | Duration: ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `[${requestId}] ${method} ${url} | Status: ${error.status || 500} | Duration: ${duration}ms | Error: ${error.message}`,
        );
        throw error;
      }),
    );
  }
}
