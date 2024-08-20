import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionCodes } from '../types/exceptionCodes.type';

export class UserNotVerifiedException extends HttpException {
  constructor(message?: string) {
    super(
      {
        errorCode: ExceptionCodes.UnverifiedUser,
        message: message || 'Please verify your account first',
      },
      HttpStatus.PRECONDITION_REQUIRED
    );
  }
}
