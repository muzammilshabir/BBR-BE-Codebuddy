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
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { ResidenceRepository } from '../residences/residences.repository';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
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
    ResidenceRepository,
    UnitRepository,
  ],
  exports: [UserService, UserFixture],
})
export class UserModule {}
