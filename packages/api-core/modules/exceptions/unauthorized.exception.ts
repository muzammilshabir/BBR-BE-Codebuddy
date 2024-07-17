import { UnauthorizedException as NestUnauthorizedException } from '@nestjs/common';

export class UnauthorizedException extends NestUnauthorizedException {
  constructor(userRole?: string) {
    super(`${userRole || 'User'} is not authorized`);
  }
}
