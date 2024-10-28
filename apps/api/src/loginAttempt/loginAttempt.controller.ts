import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginAttemptService } from './loginAttempt.service';

@ApiTags('LoginAttempt')
@Controller('login-attempt')
export class LoginAttemptController {
  constructor(private readonly loginAttemptService: LoginAttemptService) {}
}
