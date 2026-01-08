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
        const { message: msg } = exceptionResponse as any;
        message = msg || exception.message;
      } else {
        message = exception.message;
      }
      code = exception.name;
    } else if (
      (exception as any).statusCode &&
      (exception as any).message
    ) {
      // Handle errors from Microservices (plain objects)
      status = (exception as any).statusCode;
      message = (exception as any).message;
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
