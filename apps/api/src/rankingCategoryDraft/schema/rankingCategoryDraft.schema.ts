import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RankingCategory } from '../../rankingCategory/schema/rankingCategory.schema';

@Schema({ timestamps: true })
export class RankingCategoryDraft extends RankingCategory {
  @Prop({ required: true, type: Types.ObjectId, ref: 'RankingCategory' })
  rankingCategoryId: Types.ObjectId;
}

export const RankingCategoryDraftSchema = SchemaFactory.createForClass(RankingCategoryDraft);

RankingCategoryDraftSchema.index({ rankingCategoryId: 1 });
RankingCategoryDraftSchema.index({ createdAt: -1 });