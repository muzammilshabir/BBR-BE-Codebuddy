import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseService {
  static buildResponse(data: any, message: string) {
    return {
      success: true,
      message,
      data,
    };
  }

  static buildError(message: string, error?: any) {
    return {
      success: false,
      message,
      error,
    };
  }
}
