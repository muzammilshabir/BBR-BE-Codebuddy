import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerSupportConversation,
  CustomerSupportConversationSchema,
} from './schema/customer-support-conversation.schema';
import { CustomerSupportConversationController } from './customer-support-conversation.controller';
import { CustomerSupportConversationService } from './customer-support-conversation.service';
import { CustomerSupportConversationRepository } from './customer-support-conversation.repository';
import { CustomerSupportModule } from '../customer-support/customer-support.module';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';
import {
  DeveloperProfileActivityLog,
  DeveloperProfileActivityLogSchema,
} from 'src/developer-profile-activity-log/schema/developer-profile-activity-log.schema';
import {
  SupportActivityLog,
  SupportActivityLogSchema,
} from 'src/support-activity-log/schema/support-activity-log.schema';
import { SupportActivityLogRepository } from 'src/support-activity-log/support-activity-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerSupportConversation.name, schema: CustomerSupportConversationSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    MongooseModule.forFeature([
      { name: SupportActivityLog.name, schema: SupportActivityLogSchema },
    ]),
    CustomerSupportModule,
  ],
  controllers: [CustomerSupportConversationController],
  providers: [
    CustomerSupportConversationService,
    CustomerSupportConversationRepository,
    DeveloperProfileActivityLogRepository,
    SupportActivityLogRepository,
  ],
  exports: [CustomerSupportConversationService],
})
export class CustomerSupportConversationModule {}
