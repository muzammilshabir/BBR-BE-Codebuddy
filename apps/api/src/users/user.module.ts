import { TokenGenerationModule } from '@bbr/api-core/modules/token-generation/token.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { ServiceConfig } from '../config';
import { jwtConfig } from '../utils/jwt.config';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserFixture } from './user.fixture';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register(jwtConfig),
    ConfigModule.forRoot(),
    TokenGenerationModule,
    MailerCoreModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    ServiceConfig,
    UserRepository,
    UserFixture,
  ],
  exports: [UserService, UserFixture],
})
export class UserModule {}
