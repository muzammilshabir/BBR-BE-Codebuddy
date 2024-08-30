import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NewsroomCategory extends Document {

  @Prop({ required: true, unique: true  })
  title: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const NewsroomCategorySchema = SchemaFactory.createForClass(NewsroomCategory);
