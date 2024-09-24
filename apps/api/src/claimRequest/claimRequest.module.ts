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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClaimRequest.name, schema: ClaimRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Residence.name, schema: ResidenceSchema }]),
    MongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
    RedisModule,
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
  ],
  exports: [],
  controllers: [ClaimRequestController],
})
export class ClaimRequestModule {}
