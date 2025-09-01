import { JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ServiceConfig } from '../../config';
import { JwtPayloadType } from '../type/jwt-payload.type';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly appConfigService: ServiceConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfigService.jwt.rtSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayloadType): JwtPayloadType {
    if (payload?.tokenType !== JwtTokenType.REFRESH) {
      throw new ForbiddenException('Invalid token');
    }

    return payload;
  }
}
