import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(errors?: Record<string, any>) {
    super(errors || 'Validation failed');
    this.name = 'ValidationException';
  }
}
