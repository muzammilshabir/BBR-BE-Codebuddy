import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Unit } from '../../unit/schema/unit.schema';

@Schema({ timestamps: true })
export class UnitDraft extends Unit {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Unit' })
  unitId: Types.ObjectId;
}

export const UnitDraftSchema = SchemaFactory.createForClass(UnitDraft);
