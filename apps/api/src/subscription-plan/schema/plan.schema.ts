import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { Interval } from '../enum/interval.enum';

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({
    type: String,
    example: 'Premium Residence Profile',
  })
  name: string;

  @Prop({
    type: Number,
    example: 5000,
  })
  fee: number;

  @Prop({
    type: String,
    enum: Interval,
    example: 'month',
  })
  billingCycle: Interval;

  @Prop({
    type: Number,
    example: 'Days of trial period',
  })
  trialPeriod: number;

  @Prop({
    type: [
      {
      type: {
        id: { type: Types.ObjectId, ref: 'Feature' },
        active: Boolean,
        order: Number,
      }
    }
  ],
    _id: false,
  })
  features: {
    id: Types.ObjectId,
    active: boolean,
    order: number,
  }[];

  @Prop({
    type: Boolean,
    example: false,
  })
  active: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: User;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
