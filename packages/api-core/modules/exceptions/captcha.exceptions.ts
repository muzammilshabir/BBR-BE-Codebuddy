import { ExceptionCodes } from '@bbr/api-core/modules/types/exceptionCodes.type';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CaptchaRequiredException extends HttpException {
  constructor(message?: string) {
    super(
      {
        errorCode: ExceptionCodes.CaptchaRequired,
        message: message || 'Captcha is required',
      },
      HttpStatus.FORBIDDEN
    );
  }
}

export class InvalidCaptchaTokenException extends HttpException {
  constructor(message?: string) {
    super(
      {
        errorCode: ExceptionCodes.InvalidCaptchaToken,
        message: message || 'Invalid captcha token',
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CaptchaValidationFailedException extends HttpException {
  constructor(message?: string) {
    super(
      {
        errorCode: ExceptionCodes.CaptchaValidationFailed,
        message: message || 'Captcha validation failed',
      },
      HttpStatus.FORBIDDEN
    );
  }
}
