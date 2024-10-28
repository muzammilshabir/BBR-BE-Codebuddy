import { Injectable } from '@nestjs/common';
import { LoginAttemptRepository } from './loginAttempt.repository';

@Injectable()
export class LoginAttemptService {
  constructor(private readonly loginAttemptRepository: LoginAttemptRepository) {}
}
