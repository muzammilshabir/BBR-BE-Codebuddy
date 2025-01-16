import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QuickReplies } from "./schema/quick-replies.schema";
import { CreateQuickReplyDto } from "./dto/create-quick-reply.dto";




@Injectable()
export class QuickRepliesService {
  constructor(
    @InjectModel(QuickReplies.name)
    private readonly quickRepliesModel: Model<QuickReplies>,
  ) {}

    async create({ userId, message }: { userId: string; message: string }): Promise<QuickReplies> {
        const quickReply = new this.quickRepliesModel({ userId, message });
        return quickReply.save();
    }

    async findByUserId(userId: string): Promise<QuickReplies[]> {

        return this.quickRepliesModel.find({userId}).exec();
    }

    async edit({ id, userId, message }: { id: string; userId: string; message: string }): Promise<QuickReplies> {
        const quickReply = await this.quickRepliesModel.findOne({ _id: id, userId });
      
        if (!quickReply) {
          throw new Error('QuickReply not found or unauthorized');
        }
      
        quickReply.message = message;
        return quickReply.save();
      }

}