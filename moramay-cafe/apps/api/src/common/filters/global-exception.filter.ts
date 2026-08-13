import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from './error-response.interface';

/**
 * Global exception filter enforcing the constitution's error handling
 * standard (Article V): consistent `{ statusCode, message, errorCode }`
 * shape for every API error, with internal details logged but never
 * leaked to the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, errorCode } = this.resolveError(exception);

    this.logger.error(
      `${request.method} ${request.url} -> ${statusCode} [${errorCode}] ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ErrorResponseBody = { statusCode, message, errorCode };
    response.status(statusCode).json(body);
  }

  private resolveError(exception: unknown): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] })?.message ?? exception.message);
      return {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        errorCode: HttpStatus[status] ?? 'HTTP_ERROR',
      };
    }

    // Never leak internal error details to the client.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}
