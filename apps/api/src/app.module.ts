import { BbrConfigModule } from '@bbr/api-core/modules/config/configModule';
import { ServiceConfig } from './config';
import { Module } from '@nestjs/common/decorators';
import { PostModule } from './posts/post.module';
import { UserModule } from './users/user.module';
import { BbrCoreModule } from '@bbr/api-core/modules/core.module';
import { TokenGenerationModule } from '@bbr/api-core/modules/token-generation/token.module';
import { MailerCoreModule } from '@bbr/api-core/modules/mailer/mailer.module';
import { ResidenceTypeModule } from './residenceType/residenceType.module';
import { LocationModule } from './location/location.module';
import { BrandModule } from './brand/brand.module';
import { ResidenceFeatureModule } from './residenceFeatures/residenceFeatures.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { UploadModule } from './upload/upload.module';
import { ResidenceModule } from './residences/residences.module';
@Module({
  imports: [
    BbrConfigModule.forRoot({
      useClass: ServiceConfig,
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
