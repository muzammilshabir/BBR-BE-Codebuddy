import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Vacancy } from './vacancy.schema';
import { Upload } from 'src/upload/schema/upload.schema';
import { ApplicationStatus } from '../enum/career.enum';

@Schema({ timestamps: true })
export class VacancyApplication extends Document {

  @Prop({ required: true  })
  fullName: string;

  @Prop({ required: true  })
  email: string;

  @Prop({ required: true  })
  location: string;

  @Prop({ type: { type: Types.ObjectId, ref: 'Upload' }})
  resume: Upload;

  @Prop({ type: { type: Types.ObjectId, ref: 'Vacancy' }})
  vacancy: Vacancy;

  @Prop({ required: false  })
  message: string;

  @Prop({ required: true, default: ApplicationStatus.PENDING  })
  status: ApplicationStatus;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  createdAt: Date;
  
  @Prop({ type: Date })
  updatedAt: Date;
}

export const VacancyApplicationSchema = SchemaFactory.createForClass(VacancyApplication);
