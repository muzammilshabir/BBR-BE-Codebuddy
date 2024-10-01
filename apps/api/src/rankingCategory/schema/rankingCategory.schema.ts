import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { PaymentStatus } from '../enum/payment-status.enum';
import { CategoryType } from '../enum/category-type.enum';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';

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
const RankingCriteriaSchema = SchemaFactory.createForClass(RankingCriteria);

@Schema({ timestamps: true })
export class RankingCategory extends Document {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true, enum: CategoryType })
  categoryType: CategoryType;

  @Prop({ type: [RankingCriteriaSchema], required: true })
  criteria: RankingCriteria[];

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: RankingCategoryStatus, default: RankingCategoryStatus.DRAFT })
  status: RankingCategoryStatus; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdById: User;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @Prop({ type: Number, default: 0 })
  totalRequests: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const RankingCategorySchema = SchemaFactory.createForClass(RankingCategory);
