export enum CaptchaEnum {
  PREFIX = 'bbr:captcha',
  HEADER = 'x-captcha-token',
}

export interface CaptchaResponse {
  data: {
    success: true | false;
    challenge_ts: string;
    hostname: string;
    score: number;
    action: string;
  };
}
