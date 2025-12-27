import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const responseObj = exceptionResponse as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message = responseObj.message || exception.message;
        // If response has details, include them
        if (responseObj.details) {
          response.status(status).json({
            success: false,
            error: {
              code: exception.name,
              message,
              details: responseObj.details,
            },
            meta: {
              timestamp: new Date().toISOString(),
              path: request['url'],
            },
          });
          return;
        }
      } else {
        message = exception.message;
      }
      code = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request['method']} ${request['url']} - ${status} - ${message}`,
    );

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request['url'],
      },
    });
  }
}
