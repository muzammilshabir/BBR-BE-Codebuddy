import { BadRequestException as NestBadRequestException } from '@nestjs/common';

export class BadRequestException extends NestBadRequestException {
  constructor(message?: string) {
    super(message || 'Bad request');
  }
}