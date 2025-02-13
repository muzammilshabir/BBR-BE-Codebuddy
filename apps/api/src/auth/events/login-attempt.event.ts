import { LoginStatus } from '../../loginAttempt/schema/loginAttempt.schema';

export class LoginAttemptEvent {
  static readonly event = 'login.attempt';

  constructor(private readonly data: {
    userId?: string;
    status: LoginStatus;
  }) {}

  get userId() {
    return this.data.userId;
  }

  get status() {
    return this.data.status;
  }
} 