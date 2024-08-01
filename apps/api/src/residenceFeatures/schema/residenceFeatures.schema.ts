import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ResidenceFeature extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ResidenceFeatureSchema = SchemaFactory.createForClass(ResidenceFeature);
