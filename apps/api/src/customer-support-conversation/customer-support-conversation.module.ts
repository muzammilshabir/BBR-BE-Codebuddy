import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerSupportConversation, CustomerSupportConversationSchema } from './schema/customer-support-conversation.schema';
import { CustomerSupportConversationController } from './customer-support-conversation.controller';
import { CustomerSupportConversationService } from './customer-support-conversation.service';
import { CustomerSupportConversationRepository } from './customer-support-conversation.repository';
import { CustomerSupportModule } from '../customer-support/customer-support.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: CustomerSupportConversation.name, 
        schema: CustomerSupportConversationSchema 
      }
    ]),
    CustomerSupportModule,
  ],
  controllers: [CustomerSupportConversationController],
  providers: [
    CustomerSupportConversationService,
    CustomerSupportConversationRepository,
  ],
  exports: [CustomerSupportConversationService],
})
export class CustomerSupportConversationModule {} 