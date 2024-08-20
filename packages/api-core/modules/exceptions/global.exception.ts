import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import mongoose from 'mongoose';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof mongoose.Error.ValidationError) {
      this.logger.error('Validation Error', exception.message);
      return httpAdapter.reply(
        response,
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'DB validation error',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    let responseBody: Record<string, any>;
    const exceptionResponse = exception.response;

    if (exception instanceof HttpException) {
      responseBody = {
        ...exceptionResponse,
        statusCode: exception.getStatus(),
        message: exception.message,
      };
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal Server Error',
      };
    }

    this.logger.error(`Response Body: ${JSON.stringify(responseBody)}`);

    httpAdapter.reply(response, responseBody, responseBody.statusCode);
  }
}
