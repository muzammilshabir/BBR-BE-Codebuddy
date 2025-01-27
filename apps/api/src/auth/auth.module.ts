import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { RedisModule } from 'src/redis/redis.module';
import { TokenService } from '../../../../packages/api-core/modules/token-generation/token.service';
import { CaptchaGuard } from '../captcha/guards/captcha.guard';
import { ServiceConfig } from '../config';
import { UserModule } from '../users/user.module';
import { jwtConfig } from '../utils/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FailedLoginAttemptsMiddleware } from './middlewares/failed-login-attempts.middleware';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { RoleModule } from '../role/role.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginAttempt, LoginAttemptSchema } from '../loginAttempt/schema/loginAttempt.schema';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import { LoginAttemptService } from './login-attempt.service';

@Module({
  imports: [
    UserModule,
    MailerCoreModule,
    JwtModule.register(jwtConfig),
    RedisModule,
    HttpModule,
    StripeModule,
    RoleModule,
    MongooseModule.forFeature([{ name: LoginAttempt.name, schema: LoginAttemptSchema }]),
  ],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    ServiceConfig,
    CaptchaGuard,
    TokenService,
    LoginAttemptRepository,
    LoginAttemptService,
  ],
  controllers: [AuthController],
  exports: [TokenService, AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    // Add multiple routes as string args. E.g: forRoutes('path1', 'path2')
    consumer.apply(FailedLoginAttemptsMiddleware).forRoutes('auth/buyer/login/email');
  }
}
