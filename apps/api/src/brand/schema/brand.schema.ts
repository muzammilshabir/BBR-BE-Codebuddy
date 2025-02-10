import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'BrandCategory' })
  brandCategoryId: Types.ObjectId;

  @Prop({
    type: [
      {
        ImageId: { type: Types.ObjectId, ref: 'Upload' },
        type: { type: String },
      },
    ],
    _id: false,
  })
  upload: {
    ImageId: Types.ObjectId;
    type: string;
  }[];

  @Prop({ type: Date })
  registeredDate: Date;

  @Prop({
    type: String,
    enum: ['active', 'pending', 'draft', 'flagged', 'rejected', 'archived'],
    default: 'draft',
  })
  status: string;

  @Prop({ required: false })
  displayOrder?: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ required: false })
  slug?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// Add pre-save middleware to generate slug
BrandSchema.pre('save', async function (next) {
  const brand = this as Brand;

  // Only generate slug if name is new or modified
  if (!brand.isModified('name')) return next();

  brand.slug = slugify(brand.name, { lower: true });

  next();
});
