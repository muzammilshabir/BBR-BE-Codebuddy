import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Residence } from './../../residences/schema/residences.schema';
import { Types } from 'mongoose';

export class ResidenceDraft extends Residence {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Residence' })
  residenceId: Types.ObjectId;
}

export const ResidenceDraftSchema = SchemaFactory.createForClass(ResidenceDraft);
