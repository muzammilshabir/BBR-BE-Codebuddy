import { NotFoundException as NestNotFoundException } from '@nestjs/common';

export class NotFoundException extends NestNotFoundException {
  constructor(item?: string) {
    super(`${item || 'Item'} not found`);
  }
}
