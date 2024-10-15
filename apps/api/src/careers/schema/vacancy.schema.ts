import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {  VacancyDepartment } from './vacancy-department.schema';
import { JobStatus, JobType } from '../enum/career.enum';
import { Upload } from '@aws-sdk/lib-storage';

@Schema({ timestamps: true })
export class Vacancy extends Document {

  @Prop({ required: true  })
  title: string;

  @Prop({ required: true  })
  tagLine: string;

  @Prop({ required: true  })
  location: string;

  @Prop({ required: true, default: false  })
  isRemote: boolean;

  @Prop({
    required: true,
    default: JobType.FULL_TIME,
    enum: JobType,
  })
  type: JobType;

  @Prop({
    required: true,
    default: JobStatus.ACTIVE,
    enum: JobStatus,
  })
  status: JobStatus;

  @Prop({ type: { type: Types.ObjectId, ref: 'Upload' }})
  jobPicture: Upload;

  @Prop({ required: true  })
  description: string;

  @Prop({ required: true  })
  responsibilities: string;

  @Prop({ required: true  })
  qualifications: string;

  @Prop({ required: false  })
  linkedin: string;

  @Prop({ required: false, type: Array<string>  })
  skills: string[];

  @Prop({ type: { type: Types.ObjectId, ref: 'VacancyDepartment' }})
  department: VacancyDepartment;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: Date.now() })
  postedOn: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const VacancySchema = SchemaFactory.createForClass(Vacancy);
