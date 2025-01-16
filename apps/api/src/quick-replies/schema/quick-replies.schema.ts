import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true})

export class QuickReplies extends Document{

    @Prop({type: Types.ObjectId ,required: true, index: true})
    userId: Types.ObjectId;

    @Prop({ required: true})
    message: string;

    @Prop({default: true, required: false})
    active: boolean;

    createdAt: Date;
    updatedAt: Date;

}


export const QuickRepliesSchema = SchemaFactory.createForClass(QuickReplies);