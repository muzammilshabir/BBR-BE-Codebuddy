import { JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ServiceConfig } from '../../config';
import { JwtPayloadType } from '../type/jwt-payload.type';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly appConfigService: ServiceConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfigService.jwt.atSecret,
    });
  }

  validate(payload: JwtPayloadType) {
    if (payload?.tokenType !== JwtTokenType.ACCESS) {
      throw new ForbiddenException('Invalid token');
    }

    return payload;
  }
}
