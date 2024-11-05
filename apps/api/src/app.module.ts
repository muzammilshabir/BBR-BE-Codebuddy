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
import { BlogModule } from './blog/blog.module';
import { ResidenceEnquiryModule } from './residenceEnquiry/residenceEnquiry.module';
import { CareerModule } from './careers/career.module';
import { ResidenceDraftModule } from './residencesDraft/residencesDraft.module';
import { UnitDraftModule } from './unitDraft/unitDraft.module';
import { StripeModule } from './stripe/stripe.module';
import { ClaimRequestModule } from './claimRequest/claimRequest.module';
import { AppController } from './app.controller';
import { ModulePolicyModule } from './modulePolicy/modulePolicy.module';
import { RoleModule } from './role/role.module';
import { RankingCategoryModule } from './rankingCategory/rankingCategory.module';
import { RankingCategoryDraftModule } from './rankingCategoryDraft/rankingCategoryDraft.module';
import { RankingRequestDraftModule } from './rankingRequestDraft/rankingRequestDraft.module';
import { RankingRequestModule } from './rankingRequest/rankingRequest.module';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { BrandDraftModule } from './brandDraft/brandDraft.module';
import { LoginAttemptModule } from './loginAttempt/loginAttempt.module';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
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
    BlogModule,
    ResidenceEnquiryModule,
    ResidenceDraftModule,
    CareerModule,
    UnitDraftModule,
    StripeModule,
    ClaimRequestModule,
    RankingCategoryModule,
    RankingCategoryDraftModule,
    ModulePolicyModule,
    RankingRequestDraftModule,
    RankingRequestModule,
    RoleModule,
    SubscriptionPlanModule,
    BrandDraftModule,
    LoginAttemptModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    ServiceConfig,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // Permissions Guard
    },
  ],
})
export class AppModule {
  constructor(private schedulerRegistry: SchedulerRegistry) {
    // setTimeout(() => {
    //   const job = this.schedulerRegistry.getCronJob('test');
    // // job.stop();
    // console.log(job.start());
    // }, 5000);
  }
}
