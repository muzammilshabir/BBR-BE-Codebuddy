import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Upload } from 'src/upload/schema/upload.schema';
import { BlogCategory } from './blog-category.schema';

@Schema({ timestamps: true })
export class BlogPost extends Document {

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

  @Prop({ required: true })
  title: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'BlogCategory' }})
  category: BlogCategory;

  @Prop({ type: { type: Types.ObjectId, ref: 'Upload' }})
  featuredImage: Upload;

  @Prop({ required: true })
  contents: string;

  @Prop({ required: true })
  readTime: string;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
