export enum JwtTokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type JwtResponseType = {
  accessToken: string;
  refreshToken: string;
};
