import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  createdAt: Date;
  updatedAt: Date;
}

export const GeographicalAreasSchema = SchemaFactory.createForClass(GeographicalAreas);
