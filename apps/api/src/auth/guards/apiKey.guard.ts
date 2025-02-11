import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKey = process.env.API_KEY || 'my-default-api-key';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Skip guard for Swagger route
    if (request.path === '/api' || request.path === '/health-check') {
      return true;
    }

    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    if (apiKey !== this.validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
