import { BbrConfigModule } from '@bbr/api-core/modules/config/configModule';
import { BbrCoreModule } from '@bbr/api-core/modules/core.module';
import { TokenGenerationModule } from '@bbr/api-core/modules/token-generation/token.module';
import { Module } from '@nestjs/common/decorators';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './brand/brand.module';
import { ServiceConfig } from './config';
import { LifeStyleModule } from './lifestyles/lifeStyle.module';
import { LocationModule } from './location/location.module';
import { PostModule } from './posts/post.module';
import { ResidenceFeatureModule } from './residenceFeatures/residenceFeatures.module';
import { ResidenceModule } from './residences/residences.module';
import { ResidenceTypeModule } from './residenceType/residenceType.module';
import { UnitModule } from './unit/unit.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './users/user.module';
import { ReviewModule } from './reviews/reviews.module';
import { jwtConfig } from './utils/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './auth/guards/at.guard';
@Module({
  imports: [
    BbrConfigModule.forRoot({
      useClass: ServiceConfig,
    }),
    EventEmitterModule.forRoot(),
    JwtModule.register(jwtConfig),
    BbrCoreModule,
    PostModule,
    UserModule,
    TokenGenerationModule,
    MailerCoreModule,
    ResidenceTypeModule,
    LocationModule,
    BrandModule,
    ResidenceFeatureModule,
    AmenitiesModule,
    UploadModule,
    ResidenceModule,
    UnitModule,
    AuthModule,
    ReviewModule,
    LifeStyleModule,
  ],
  controllers: [],
  providers: [
    ServiceConfig,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
