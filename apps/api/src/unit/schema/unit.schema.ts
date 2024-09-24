import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
        roomTypeId: { required: false, type: Types.ObjectId, ref: 'RoomType' },
        unit: Number,
        _id: false,
      },
      _id: false,
    },
  ])
  rooms: {
    roomTypeId: Types.ObjectId;
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
            serviceTypeId: { required: false, type: Types.ObjectId, ref: 'ResidenceService' },
            amount: Number,
            recurrence: String,
            _id: false,
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
      serviceTypeId: Types.ObjectId;
      amount: number;
      recurrence: string;
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

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdById: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedById: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({
    type: String,
    enum: ['active', 'pending', 'draft', 'sold', 'rejected'],
    default: 'draft',
  })
  status: string;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
