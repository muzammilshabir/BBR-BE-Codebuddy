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
import { SuperAdminSeeder } from './superAdmin.seeder';
import { RoleRepository } from '../role/role.repository';
import { Role, RoleSchema } from '../role/schema/role.schema';
import { ModulePolicyRepository } from '../modulePolicy/modulePolicy.repository';
import { ModulePolicy, ModulePolicySchema } from '../modulePolicy/schema/modulePolicy.schema';
import { RoleService } from '../role/role.service';
import { LoginAttempt, LoginAttemptSchema } from '../loginAttempt/schema/loginAttempt.schema';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import { ClaimRequest, ClaimRequestSchema } from '../claimRequest/schema/claimRequest.schema';
import { ClaimRequestRepository } from '../claimRequest/claimRequest.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import { CometChatService } from './comet-chat.service';
import { Upload } from 'src/upload/schema/upload.schema';
import { UploadSchema } from 'src/upload/schema/upload.schema';
import { UploadRepository } from 'src/upload/upload.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    MongooseModule.forFeature([{ name: ModulePolicy.name, schema: ModulePolicySchema }]),
    JwtModule.register(jwtConfig),
    ConfigModule.forRoot(),
    TokenGenerationModule,
    MailerCoreModule,
    MongooseModule.forFeature([{ name: LoginAttempt.name, schema: LoginAttemptSchema }]),
    MongooseModule.forFeature([{ name: ClaimRequest.name, schema: ClaimRequestSchema }]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  controllers: [UserController],
  providers: [
    CometChatService,
    UserService,
    ServiceConfig,
    UserRepository,
    UserFixture,
    ResidenceRepository,
    UnitRepository,
    RoleRepository,
    ModulePolicyRepository,
    SuperAdminSeeder,
    RoleService,
    LoginAttemptRepository,
    ClaimRequestRepository,
    DeveloperProfileActivityLogRepository,
    UploadRepository,
  ],
  exports: [UserService, UserFixture, SuperAdminSeeder],
})
export class UserModule {}
