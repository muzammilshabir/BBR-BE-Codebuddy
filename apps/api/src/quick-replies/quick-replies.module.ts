import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuickReplies, QuickRepliesSchema } from './schema/quick-replies.schema';
import { QuickRepliesService } from './quick-replies.service';
import { QuickRepliesController } from './quick-replies.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: QuickReplies.name, schema: QuickRepliesSchema }])],
  providers: [QuickRepliesService],
  exports: [QuickRepliesService],
  controllers: [QuickRepliesController],
})
export class QuickRepliesModule {}
