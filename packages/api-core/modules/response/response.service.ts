import { Injectable } from "@nestjs/common";

export interface IApiResponse<T> {
  data: T;
  message?: string;
}

const sensitiveKeys = {
  password: 1,
  resetPasswordOtp: 1,
  tempEmail: 1,
  isTempPassword: 1,
  changeEmailOtp: 1,
  passwordHashMigrated: 1,
};

@Injectable()
export class ResponseService {
  constructor() {}

  static buildResponse<T>(data: T, message = "Success"): IApiResponse<T> {
    // if (data !== null && !this.hasKeyIsEntity(data)) {
    //   this.deleteSensitiveFields(data);
    // }
    return {
      data,
      message,
    };
  }

  static deleteSensitiveFields(data, seen = new WeakSet()) {
    if (Array.isArray(data)) {
      data.forEach((item) => {
        this.deleteSensitiveFields(item, seen);
      });
    } else if (typeof data === "object" && data !== null) {
      if (seen.has(data)) {
        return;
      }
      seen.add(data);

      Object.keys(data).forEach((key) => {
        if (
          Array.isArray(data[key]) ||
          (typeof data[key] === "object" && data[key] !== null)
        ) {
          this.deleteSensitiveFields(data[key], seen);
        } else if (
          typeof data[key] !== "undefined" &&
          typeof data[key] !== "function"
        ) {
          if (sensitiveKeys[key]) {
            delete data[key];
          }
        }
      });
    }
  }

  static hasKeyIsEntity(obj: any): boolean {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }

    if (obj.hasOwnProperty("isEntity")) {
      return true;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (this.hasKeyIsEntity(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }
}
