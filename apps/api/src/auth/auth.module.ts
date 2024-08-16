import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { RedisModule } from 'src/redis/redis.module';
import { ServiceConfig } from '../config';
import { UserModule } from '../users/user.module';
import { jwtConfig } from '../utils/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FailedLoginAttemptsMiddleware } from './middlewares/failed-login-attempts.middleware';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [UserModule, MailerCoreModule, JwtModule.register(jwtConfig), RedisModule],
  providers: [AuthService, AtStrategy, RtStrategy, ServiceConfig],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Add multiple routes as string args. E.g: forRoutes('path1', 'path2')
    consumer.apply(FailedLoginAttemptsMiddleware).forRoutes('auth/buyer/login/email');
  }
}
