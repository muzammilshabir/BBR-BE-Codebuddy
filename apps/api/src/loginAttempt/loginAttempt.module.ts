import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginAttempt, LoginAttemptSchema } from './schema/loginAttempt.schema';
import { LoginAttemptService } from './loginAttempt.service';
import { LoginAttemptController } from './loginAttempt.controller';
import { LoginAttemptRepository } from './loginAttempt.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: LoginAttempt.name, schema: LoginAttemptSchema }])],
  providers: [LoginAttemptService, LoginAttemptRepository],
  exports: [],
  controllers: [LoginAttemptController],
})
export class LoginAttemptModule {}
