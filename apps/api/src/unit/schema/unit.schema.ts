import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RoomType } from '../enum/unit-enum';

@Schema({ timestamps: true })
export class Unit extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;

  @Prop({ required: true })
  unitName: string;

  @Prop({
    type: {
      unitNumber: String,
      generalUnitSpaceSqFt: Number,
      floor: Number,
    },
    _id: false,
  })
  specs: {
    unitNumber: string;
    generalUnitSpaceSqFt: number;
    floor: number;
  };

  @Prop()
  unitPrice: number;

  @Prop({
    type: {
      exclusiveUnitPrice: Number,
      OfferStartDate: Date,
      OfferEndDate: Date,
    },
    _id: false,
  })
  exclusiveOffer: {
    exclusiveUnitPrice: number;
    OfferStartDate: Date;
    OfferEndDate: Date;
  };

  @Prop([
    {
      type: {
        roomType: { type: String, enum: Object.values(RoomType) },
        unit: Number,
        _id: false,
      },
      _id: false,
    },
  ])
  rooms: {
    roomType: RoomType;
    unit: number;
  }[];

  @Prop({
    type: {
      subTitle: String,
      description: String,
    },
    _id: false,
    required: true,
  })
  briefOverview: {
    subTitle: string;
    description: string;
  };

  @Prop({
    type: {
      features: [String],
      residenceServices: [
        {
          type: {
            serviceType: String,
            amount: Number,
            recurrence: [String],
          },
          _id: false,
        },
      ],
    },
    _id: false,
  })
  unitKeyFeatures: {
    features: string[];
    residenceServices: {
      serviceType: string;
      amount: number;
      recurrence: string[];
    }[];
  };

  @Prop({
    type: {
      mainGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      secondGalleryPhotos: [{ type: Types.ObjectId, ref: 'Upload' }],
      videoTour: { type: Types.ObjectId, ref: 'Upload' },
      videoTourLink: String,
    },
    _id: false,
  })
  visuals: {
    mainGalleryPhotos: Types.ObjectId[];
    secondGalleryPhotos: Types.ObjectId[];
    videoTour: Types.ObjectId;
    videoTourLink: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
