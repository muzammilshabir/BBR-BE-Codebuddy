import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Feature extends Document {
  @Prop({
    type: String,
    example: 'Includes all Basic Plan features',
  })
  name: string;

  @Prop({
    type: Boolean,
    example: false,
  })
  active: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
