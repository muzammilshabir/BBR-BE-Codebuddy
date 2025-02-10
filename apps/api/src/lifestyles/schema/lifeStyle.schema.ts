import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class LifeStyle extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    type: [
      {
        ImageId: { type: Types.ObjectId, ref: 'Upload' },
        type: { type: String, required: false },
      },
    ],
    _id: false,
    default: [],
  })
  upload?: {
    ImageId: Types.ObjectId;
    type?: string;
  }[];

  @Prop({ required: false })
  displayOrder?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: false, unique: true })
  slug?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const LifeStyleSchema = SchemaFactory.createForClass(LifeStyle);

// Add pre-save middleware to generate slug
LifeStyleSchema.pre('save', async function (next) {
  const lifeStyle = this as LifeStyle;

  // Only generate slug if name is new or modified
  if (!lifeStyle.isModified('name')) return next();

  lifeStyle.slug = slugify(lifeStyle.name, { lower: true });

  next();
});
