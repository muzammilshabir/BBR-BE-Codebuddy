import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: String, default: null })
  parentId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
