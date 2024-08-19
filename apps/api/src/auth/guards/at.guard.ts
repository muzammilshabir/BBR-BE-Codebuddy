import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { ServiceConfig } from '../../config';
import { UserService } from '../../users/user.service';
import { JwtPayloadType } from '../type/jwt-payload.type';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/enum/user.enum';
import { ForbiddenException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly appConfigService: ServiceConfig
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    const isRefresh = this.reflector.getAllAndOverride('isRefresh', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || isRefresh) return true;

    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(context.switchToHttp().getRequest());
      if (!token) throw new UnauthorizedException('Invalid token');

      const user = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret: this.appConfigService.jwt.atSecret,
      });

      const userInDb = await this.userService.findById(user.sub);
      if (!userInDb) throw new UnauthorizedException();

      // Get required roles from the metadata (if any)
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && !requiredRoles.includes(userInDb.role)) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
    } catch (error) {
      // Rethrow the ForbiddenException if roles check fails, otherwise throw Unauthorized
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException();
    }

    // Call the super method to ensure the base `AuthGuard` logic is executed
    return (await super.canActivate(context)) as boolean;
  }
}
