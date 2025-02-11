import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SwaggerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [authType, encoded] = authorizationHeader.split(' ');

    if (authType !== 'Basic' || !encoded) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    // Decode Base64 (username:password)
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [, password] = decoded.split(':');

    if (password !== process.env.SWAGGER_PASSWORD) {
      throw new UnauthorizedException('Invalid password');
    }

    return true;
  }
}
