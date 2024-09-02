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
import { LeadModule } from './lead/lead.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { BrandCategoryModule } from './brandCategory/brandCategory.module';
import { NewsroomModule } from './newsroom/newsroom.module';
import { GeographicalAreasModule } from './geographicalAreas/geographicalAreas.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';
import { PropertyTypeModule } from './propertyType/propertyType.module';
import { RoomTypeModule } from './roomType/roomType.module';
import { ResidenceServiceModule } from './residenceService/residenceService.module';
import { ResidenceEnquiryModule } from './residenceEnquiry/residenceEnquiry.module';
import { CareerModule } from './careers/career.module';
import { ResidenceDraftModule } from './residencesDraft/residencesDraft.module';
import { BlogModule } from './blog/blog.module';
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
    LeadModule,
    NewsletterModule,
    BrandCategoryModule,
    NewsroomModule,
    GeographicalAreasModule,
    ResidenceServiceModule,
    CountryModule,
    CityModule,
    PropertyTypeModule,
    RoomTypeModule,
    ResidenceEnquiryModule,
    CareerModule,
    ResidenceDraftModule,
    BlogModule,
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
