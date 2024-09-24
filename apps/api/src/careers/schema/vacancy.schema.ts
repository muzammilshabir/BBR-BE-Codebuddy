import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {  VacancyDepartment } from './vacancy-department.schema';

@Schema({ timestamps: true })
export class Vacancy extends Document {

  @Prop({ required: true  })
  title: string;

  @Prop({ required: true  })
  tagLine: string;

  @Prop({ required: true  })
  description: string;

  @Prop({ required: false, type: Array<string>  })
  skills: string[];

  @Prop({ type: { type: Types.ObjectId, ref: 'VacancyDepartment' }})
  department: VacancyDepartment;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const VacancySchema = SchemaFactory.createForClass(Vacancy);
