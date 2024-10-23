import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { CategoryType } from '../enum/category-type.enum';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';
import { RankingCriteria } from './rankingCriteria.schema';

@Schema({ timestamps: true })
export class RankingCategory extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: CategoryType })
  categoryType: CategoryType;

  @Prop({ type: [RankingCriteria], required: true })
  criteria: RankingCriteria[];

  @Prop({ required: true })
  price: number;

  @Prop({
    type: String,
    example: 'Invalid Document',
  })
  rejectionReason: string;

  @Prop({
    type: String,
    example: 'description',
  })
  description: string;

  @Prop({ required: true })
  residenceLimitation: number;

  @Prop({ required: true, enum: RankingCategoryStatus, default: RankingCategoryStatus.DRAFT })
  status: RankingCategoryStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdById: User;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({
    type: [
      {
        ImageId: { type: Types.ObjectId, ref: 'Upload' },
        type: { type: String, required: false },
      },
    ],
    _id: false,
    default: [],
  })
  upload?: {
    ImageId: Types.ObjectId;
    type?: string;
  }[];

  @Prop({ type: Number, default: 0 })
  totalRequests: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const RankingCategorySchema = SchemaFactory.createForClass(RankingCategory);
