import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimRequest, ClaimRequestSchema } from './schema/claimRequest.schema';
import { ClaimRequestService } from './claimRequest.service';
import { ClaimRequestController } from './claimRequest.controller';
import { ClaimRequestRepository } from './claimRequest.repository';
import { User, UserSchema } from '../users/schema/user.schema';
import { UserRepository } from '../users/user.repository';
import { Residence, ResidenceSchema } from '../residences/schema/residences.schema';
import { ResidenceRepository } from '../residences/residences.repository';
import { Unit, UnitSchema } from '../unit/schema/unit.schema';
import { UnitRepository } from '../unit/unit.repository';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';
import { ServiceConfig } from '../config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { RoleModule } from '../role/role.module';
import { HttpModule } from '@nestjs/axios';
import { LoginAttempt, LoginAttemptSchema } from '../loginAttempt/schema/loginAttempt.schema';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import {
  ResidenceDraft,
  ResidenceDraftSchema,
} from '../residencesDraft/schema/residencesDraft.schema';
import { ResidenceDraftRepository } from '../residencesDraft/residencesDraft.repository';
import {
  ResidenceActivityLog,
  ResidenceActivityLogSchema,
} from 'src/residence-activity-log/schema/residence-activity-log.schema';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClaimRequest.name, schema: ClaimRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    RedisModule,
    StripeModule,
    RoleModule,
    HttpModule,
    MongooseModule.forFeature([{ name: LoginAttempt.name, schema: LoginAttemptSchema }]),
    MongooseModule.forFeature([{ name: ResidenceDraft.name, schema: ResidenceDraftSchema }]),
    MongooseModule.forFeature([
      { name: ResidenceActivityLog.name, schema: ResidenceActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
  ],
  providers: [
    ClaimRequestService,
    ClaimRequestRepository,
    UserRepository,
    ResidenceRepository,
    UnitRepository,
    TokenService,
    UserService,
    ServiceConfig,
    JwtService,
    RedisService,
    AuthService,
    LoginAttemptRepository,
    ResidenceDraftRepository,
    ResidenceActivityLogRepository,
    DeveloperProfileActivityLogRepository,
  ],
  exports: [],
  controllers: [ClaimRequestController],
})
export class ClaimRequestModule {}
