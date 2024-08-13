import { JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { UserRole } from '../../users/enum/user.enum';

export type JwtPayloadType = {
  email: string;
  sub: string;
  role: UserRole;
  tokenType: JwtTokenType;
};
