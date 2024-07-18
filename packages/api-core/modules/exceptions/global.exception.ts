import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Catch,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ValidationError as SequelizeValidationError } from 'sequelize';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`Exception thrown: ${exception.message}`, exception.stack);

    if (exception instanceof SequelizeValidationError) {
      this.logger.error('Validation Error', exception.message);
      const messages = exception.errors.map((err) => err.message);
      return httpAdapter.reply(
        response,
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'DB validation error',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      message: exception instanceof HttpException ? exception.message : 'Internal Server Error',
    };

    this.logger.error(`Response Body: ${JSON.stringify(responseBody)}`);
    
    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
