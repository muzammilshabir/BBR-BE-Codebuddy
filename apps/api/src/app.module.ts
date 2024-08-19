import { BbrConfigModule } from '@bbr/api-core/modules/config/configModule';
import { BbrCoreModule } from '@bbr/api-core/modules/core.module';
import { TokenGenerationModule } from '@bbr/api-core/modules/token-generation/token.module';
import { Module } from '@nestjs/common/decorators';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { AuthModule } from './auth/auth.module';
import { BrandModule } from './brand/brand.module';
import { ServiceConfig } from './config';
import { LocationModule } from './location/location.module';
import { PostModule } from './posts/post.module';
import { ResidenceFeatureModule } from './residenceFeatures/residenceFeatures.module';
import { ResidenceModule } from './residences/residences.module';
import { ResidenceTypeModule } from './residenceType/residenceType.module';
import { UnitModule } from './unit/unit.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './users/user.module';
@Module({
  imports: [
    BbrConfigModule.forRoot({
      useClass: ServiceConfig,
    }),
    EventEmitterModule.forRoot(),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
