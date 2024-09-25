import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Upload } from 'src/upload/schema/upload.schema';
import { NewsroomCategory } from './newsroom-category.schema';

@Schema({ timestamps: true })
export class Newsroom extends Document {

  @Prop({ 
    type: {
      name: String,
      photo: { type: Types.ObjectId, ref: 'Upload' },
    },
    _id: false,
  })
  author: {
    name: string;
    photo: Upload;
  };

  @Prop({ required: true, unique: true  })
  title: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'NewsroomCategory' }})
  category: NewsroomCategory;

  @Prop({ type: { type: Types.ObjectId, ref: 'Upload' }})
  featuredImage: Upload;

  @Prop({ required: true })
  contents: string;

  @Prop({ required: true })
  readTime: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const NewsroomSchema = SchemaFactory.createForClass(Newsroom);
