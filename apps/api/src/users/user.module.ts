import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema'; 
import { jwtConfig } from '../utils/jwt.config';
import { TokenGenerationModule } from '@bbr/api-core/modules/token-generation/api-core.module';
import { MailerCoreModule } from '@bbr/api-core/modules/mailer/mailer.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register(jwtConfig),
    ConfigModule.forRoot(),
    TokenGenerationModule,
    MailerCoreModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
