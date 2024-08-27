import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BrandCategoryEnum } from '../enum/brandCategory-enum';

@Schema({ timestamps: true })
export class BrandCategory extends Document {
  @Prop({ required: true, enum: BrandCategoryEnum })
  name: BrandCategoryEnum;

  createdAt: Date;
  updatedAt: Date;
}

export const BrandCategorySchema = SchemaFactory.createForClass(BrandCategory);
