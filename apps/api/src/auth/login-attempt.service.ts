import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import { LoginAttemptEvent } from './events/login-attempt.event';

@Injectable()
export class LoginAttemptService {
  constructor(private readonly loginAttemptRepository: LoginAttemptRepository) {}

  @OnEvent(LoginAttemptEvent.event)
  async handleLoginAttempt(event: LoginAttemptEvent) {
    try {
      await this.loginAttemptRepository.createLoginAttempt(event.userId, event.status);
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }
} 