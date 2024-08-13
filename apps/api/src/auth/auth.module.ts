import { MailerCoreModule } from '@bbr/api-core/modules/mailer/mailer.module';
import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, MailerCoreModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
