import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

@Schema({ timestamps: true })
export class Country extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  countryCode: string;

  @Prop({ required: false })
  phoneCode: string;

  @Prop({ type: Types.ObjectId, ref: 'GeographicalAreas', required: false })
  geographicalAreasId?: Types.ObjectId;

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

  @Prop({ default: false, required: false })
  active: boolean;

  @Prop({ required: false, unique: true })
  slug?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

// Add pre-save middleware to generate slug
CountrySchema.pre('save', async function (next) {
  const city = this as Country;

  // Only generate slug if name is new or modified
  if (!city.isModified('name')) return next();

  city.slug = slugify(city.name, { lower: true });

  next();
});
