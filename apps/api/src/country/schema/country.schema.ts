import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Country extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  countryCode: string;

  @Prop({ required: false })
  phoneCode: string;

  @Prop({ required: false })
  capital: string;

  @Prop({ required: false })
  currency: string;

  @Prop({ required: false })
  native: string;

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

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false, required: false })
  active: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
