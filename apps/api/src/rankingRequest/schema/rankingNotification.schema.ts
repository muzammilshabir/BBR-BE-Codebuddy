import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RankingRequestNotification extends Document {
  @Prop({ type: Boolean, default: false })
  disableAllNotifications: boolean;

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      positions: { type: Number, default: 1 },
    },
    _id: false,
  })
  moveUpInRankings: {
    enabled: boolean;
    positions: number;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      positions: { type: Number, default: 1 },
    },
    _id: false,
  })
  moveDownInRankings: {
    enabled: boolean;
    positions: number;
  };

  @Prop({ type: Boolean, default: false })
  rankingCriteriaChanged: boolean;

  @Prop({ type: Boolean, default: false })
  rankingCriteriaChangeUpdated: boolean;

  @Prop({ type: Boolean, default: false })
  rankingCriteriaChangeDowngraded: boolean;

  @Prop({ type: Boolean, default: false })
  becomesTopPerformer: boolean;

  @Prop({ type: Boolean, default: false })
  competitorSurpassedRanking: boolean;

  @Prop({
    type: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    _id: false,
  })
  notifyVia: {
    push: boolean;
    email: boolean;
    whatsapp: boolean;
  };
}

export const RankingRequestNotificationSchema = SchemaFactory.createForClass(
  RankingRequestNotification
);
