export enum CaptchaEnum {
  PREFIX = 'bbr:captcha',
  HEADER = 'x-captcha-token',
}

// Google reCaptcha error codes
type CaptchaErrorCodes =
  | 'missing-input-secret'
  | 'invalid-input-secret'
  | 'missing-input-response'
  | 'invalid-input-response'
  | 'bad-request'
  | 'timeout-or-duplicate';

export interface CaptchaResponse {
  data: {
    success: true | false;
    challenge_ts: string;
    hostname: string;
    score: number;
    action: string;
    'error-codes': CaptchaErrorCodes[];
  };
}
