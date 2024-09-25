import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

@Schema({ timestamps: true })
export class VacancyDepartment extends Document {

  @Prop({ required: true, unique: true  })
  title: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, })
  createdById: User;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const VacancyDepartmentSchema = SchemaFactory.createForClass(VacancyDepartment);
