import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class RankingCriteria {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  scoreGuide: {
    score: number;
    description: string;
  }[];
}
export const RankingCriteriaSchema = SchemaFactory.createForClass(RankingCriteria);
