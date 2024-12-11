import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EditorNote extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Residence', required: true })
  residenceId: Types.ObjectId;

  @Prop({
    type: [
      {
        topic: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    _id: false,
    default: [],
  })
  notes: Array<{
    topic: string;
    description: string;
  }>;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const EditorNoteSchema = SchemaFactory.createForClass(EditorNote);
