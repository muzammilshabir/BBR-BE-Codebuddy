import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { ServiceConfig } from '../../config';
import { UserService } from '../../users/user.service';
import { JwtPayloadType } from '../type/jwt-payload.type';

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
    } catch (error) {
      throw new UnauthorizedException();
    }

    return (await super.canActivate(context)) as boolean;
  }
}
