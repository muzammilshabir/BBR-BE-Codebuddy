import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ResidenceType extends Document {
  @Prop({ required: true, unique: true })
  type: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ResidenceTypeSchema = SchemaFactory.createForClass(ResidenceType);