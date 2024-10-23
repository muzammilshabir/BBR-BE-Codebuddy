import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Interval } from '../enum/interval.enum';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;

  @Prop({
    type: {
      interval: String,
      interval_count: String,
    },
    _id: false,
  })
  recurring: {
    interval:  Interval;
    interval_count: number;
  };

  @Prop({
    type: String,
    example: '33r2324sds423',
  })
  paymentMethodId: string;

  @Prop({
    type: Number,
    example: 7,
  })
  reminderDays: number;

  @Prop({
    type: Number,
    example: 3,
  })
  renewalAttempts: number;

  @Prop({
    type: Number,
    example: 1,
  })
  attemptsFrequency: number

  @Prop({
    type: Number,
    example: 7,
  })
  gracePeriod: number;;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: User;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
