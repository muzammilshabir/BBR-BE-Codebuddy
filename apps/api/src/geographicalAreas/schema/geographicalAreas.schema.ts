import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class GeographicalAreas extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  type?: string; // Optional field to specify the type of geographical area, e.g., "Continent", "Region"

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

export const GeographicalAreasSchema = SchemaFactory.createForClass(GeographicalAreas);

// Add pre-save middleware to generate slug
GeographicalAreasSchema.pre('save', async function (next) {
  const city = this as GeographicalAreas;

  // Only generate slug if name is new or modified
  if (!city.isModified('name')) return next();

  city.slug = slugify(city.name, { lower: true });

  next();
});
