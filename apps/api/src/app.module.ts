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
import { PdfModule } from './pdf/pdf.module';
import { CustomerReviewsModule } from './customer-reviews/customer-reviews.module';
import { GuestUserModule } from './guestUser/guast-user.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { CustomerSupportModule } from './customer-support/customer-support.module';
import { MarketingModule } from './marketing/marketing.module';
import { CalendlyWebhookModule } from './calendly/calendlyWebhook.module';
import { AdminNoteModule } from './admin-note/admin-note.module';
import { FeatureRequestModule } from './featureRequests/featureRequests.module';
import { BbrVerificationModule } from './bbr-verification/bbr-verification.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { CustomerSupportConversationModule } from './customer-support-conversation/customer-support-conversation.module';
import { AdditionalServiceModule } from './additional-service/additional-service.module';
import { EditorNoteModule } from './editor-note/editor-note.module';
import { BespokeRequestModule } from './bespokeRequests/bespokeRequests.module';
import { StateModule } from './state/state.module';
import { ResidenceActivityLogModule } from './residence-activity-log/residence-activity-log.module';
import { LeadsActivityLogModule } from './leads-activity-log/leads-activity-log.module';
import { DeveloperProfileActivityLogModule } from './developer-profile-activity-log/developer-profile-activity-log.module';
import { BrandActivityLogModule } from './brand-activity-log/brand-activity-log.module';
import { VacancyActivityLogModule } from './vacancy-activity-log/vacancy-activity-log.module';
import { VacancyApplicationActivityLogModule } from './vacancy-application-activity-log/vacancy-activity-log.module';
import { SupportActivityLogModule } from './support-activity-log/support-activity-log.module';
import { DevResidenceActivityLogModule } from './dev-residence-activity-log/dev-residence-activity-log.module';
import { DevLeadsActivityLogModule } from './dev-leads-activity-log/dev-leads-activity-log.module';
import { RankingActivityLogModule } from './ranking-activity-log/ranking-activity-log.module';
import { DevRankingActivityLogModule } from './dev-ranking-activity-log/dev-ranking-activity-log.module';
import { InvoiceScheduleModule } from './invoice-schedule/invoiceSchedule.module';
import { JobsModule } from './backgroundJobs/backgroundJobs.module';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BbrConfigModule.forRoot({ useClass: ServiceConfig }),
    BullModule.forRoot({
      connection: {
        host: process.env.APP_REDIS_HOST,
        port: Number(process.env.APP_REDIS_PORT),
        username: process.env.APP_REDIS_USER,
        password: process.env.APP_REDIS_PASSWORD,
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
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
    PdfModule,
    CustomerReviewsModule,
    GuestUserModule,
    InvoiceModule,
    ActivityLogModule,
    CustomerSupportModule,
    MarketingModule,
    CalendlyWebhookModule,
    AdminNoteModule,
    FeatureRequestModule,
    BbrVerificationModule,
    MatchmakingModule,
    CustomerSupportConversationModule,
    AdditionalServiceModule,
    EditorNoteModule,
    BespokeRequestModule,
    StateModule,
    RankingActivityLogModule,
    ResidenceActivityLogModule,
    LeadsActivityLogModule,
    DeveloperProfileActivityLogModule,
    BrandActivityLogModule,
    VacancyActivityLogModule,
    VacancyApplicationActivityLogModule,
    SupportActivityLogModule,
    DevResidenceActivityLogModule,
    DevLeadsActivityLogModule,
    DevRankingActivityLogModule,
    InvoiceScheduleModule,
    JobsModule,
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
