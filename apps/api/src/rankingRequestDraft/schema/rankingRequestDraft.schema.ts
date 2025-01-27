import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RankingRequest } from '../../rankingRequest/schema/rankingRequest.schema';

@Schema({ timestamps: true })
export class RankingRequestDraft extends RankingRequest {
  @Prop({ required: true, type: Types.ObjectId, ref: 'RankingRequest' })
  rankingRequestId: Types.ObjectId;
}

export const RankingRequestDraftSchema = SchemaFactory.createForClass(RankingRequestDraft);

RankingRequestDraftSchema.index({ createdAt: -1 });
RankingRequestDraftSchema.index({ rankingRequestId: 1 });