import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { UserService } from '../../users/user.service';
import { RoleService } from '../../role/role.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayloadType } from '../type/jwt-payload.type';
import { ServiceConfig } from '../../config';
import { UserRole } from '../../users/enum/user.enum';
import { PermissionLevel } from '../../modulePolicy/enum/permission-enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private readonly appConfigService: ServiceConfig
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<{
      module: string;
      permission: string;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true; // No permissions required, allow access
    }

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
      if (!token) throw new UnauthorizedException('Token not found');

      const secret = this.appConfigService.jwt.atSecret;

      const user = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret,
      });

      const userInDb = await this.userService.findById(user.sub);
      if (!userInDb) throw new UnauthorizedException();

      if (user?.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Only admin type of user can access');
      }

      if (!userInDb?.roleId) {
        throw new UnauthorizedException('Role is not assigned');
      }

      // Cast `requiredPermissions.permission` to `PermissionLevel`
      const permissionLevel = requiredPermissions.permission as PermissionLevel;

      const hasPermission = await this.roleService.hasPermission(userInDb, {
        module: requiredPermissions.module,
        permission: permissionLevel,
      });

      if (!hasPermission) throw new ForbiddenException('Insufficient permissions');

      return true; // Access granted
    } catch (error) {
      console.error('Error in JWT verification:', error);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      if (error instanceof ForbiddenException) {
        throw error; // Preserve the `ForbiddenException` thrown during permission check
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
