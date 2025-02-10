import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';


@Schema({ timestamps: true })
export class City extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  stateCode: string;

  @Prop({ required: false })
  countryCode: string;

  @Prop({ type: Types.ObjectId, ref: 'State', required: false })
  stateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  countryId: Types.ObjectId;

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

export const CitySchema = SchemaFactory.createForClass(City);

// Add pre-save middleware to generate slug
CitySchema.pre('save', async function (next) {
  const city = this as City;

  // Only generate slug if name is new or modified
  if (!city.isModified('name')) return next();

  city.slug = slugify(city.name, { lower: true });

  next();
});
