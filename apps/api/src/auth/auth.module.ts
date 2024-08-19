import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { ServiceConfig } from '../config';
import { UserModule } from '../users/user.module';
import { jwtConfig } from '../utils/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [UserModule, MailerCoreModule, JwtModule.register(jwtConfig)],
  providers: [AuthService, AtStrategy, RtStrategy, ServiceConfig],
  controllers: [AuthController],
})
export class AuthModule {}
