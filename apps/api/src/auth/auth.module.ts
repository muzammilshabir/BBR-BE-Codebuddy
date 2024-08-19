import { MailerCoreModule } from '@bbr/api-core/modules/mailer/mailer.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
