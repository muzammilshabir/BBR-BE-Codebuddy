import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Newsletter, NewsletterSchema } from './schema/newsletter.schema';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterRepository } from './newsletter.repository';
import { NewsletterSeeder } from './newsletter.seeder';
import { NewsletterFixture } from './newsletter.fixture';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/users/user.module';
import { ResidenceModule } from 'src/residences/residences.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    StripeModule,
    MongooseModule.forFeature([{ name: Newsletter.name, schema: NewsletterSchema }]),
  ],
  providers: [NewsletterService, NewsletterRepository, NewsletterSeeder,NewsletterFixture],
  exports: [NewsletterSeeder, NewsletterFixture],
  controllers: [NewsletterController],
})
export class NewsletterModule {}