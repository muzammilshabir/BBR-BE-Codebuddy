import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ResidenceEnquiry extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false, type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Residence' })
  residenceId?: Types.ObjectId;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Unit' })
  unitId?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ResidenceEnquirySchema = SchemaFactory.createForClass(ResidenceEnquiry);
