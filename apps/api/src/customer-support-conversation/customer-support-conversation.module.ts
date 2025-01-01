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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerSupportConversation.name, schema: CustomerSupportConversationSchema },
    ]),
    MongooseModule.forFeature([
      { name: DeveloperProfileActivityLog.name, schema: DeveloperProfileActivityLogSchema },
    ]),
    CustomerSupportModule,
  ],
  controllers: [CustomerSupportConversationController],
  providers: [
    CustomerSupportConversationService,
    CustomerSupportConversationRepository,
    DeveloperProfileActivityLogRepository,
  ],
  exports: [CustomerSupportConversationService],
})
export class CustomerSupportConversationModule {}
