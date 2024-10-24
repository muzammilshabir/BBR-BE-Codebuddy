import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Brand } from '../../brand/schema/brand.schema';

@Schema({ timestamps: true })
export class BrandDraft extends Brand {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Brand' })
  brandId: Types.ObjectId;
}

export const BrandDraftSchema = SchemaFactory.createForClass(BrandDraft);
