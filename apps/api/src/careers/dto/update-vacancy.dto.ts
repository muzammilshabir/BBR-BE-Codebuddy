import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { JobStatus, JobType } from '../enum/career.enum';


export class UpdateVacancyDto {

  @ApiProperty({
    example: 'Sales Executive',
    type: String,
  })
  title?: string;

  @ApiProperty({
    example: 'customer service role',
    type: String,
  })
  tagLine?: string;

  @ApiProperty({
    example: false,
    required: false,
    type: Boolean,
  })
  isRemote?: string;

  @ApiProperty({
    example: 'Paris, France',
    required: false,
    type: String,
  })
  location?: string;

  @ApiProperty({
    example: JobType.FULL_TIME,
    required: false,
    type: JobType,
  })
  type?: JobType;

  @ApiProperty({
    example: JobStatus.ACTIVE,
    required: false,
    type: JobStatus,
  })
  status?: JobStatus;

  @ApiProperty({ example: '66acda8b857c576159b741a2', required: false })
  jobPicture?: Types.ObjectId;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    type: String,
  })
  description?: string;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: false,
    type: String,
  })
  responsibilities?: string;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: false,
    type: String,
  })
  qualifications?: string;

  @ApiProperty({
    example: ['CRM', 'MS Office'],
    type: Array<string>,
  })
  skills?: string[];

  @ApiProperty({ example: '66acda8b857c576159b744a2' })
  department?: Types.ObjectId;
}

export const updateVacancyDtoSchema = Joi.object({
  title: Joi.string().optional(),
  tagLine: Joi.string().optional(),
  isRemote: Joi.boolean().optional(),
  location: Joi.string().optional(),
  jobPicture: Joi.string().custom(joiObjectIdValidator('jobPicture')).optional(),
  type: Joi.string().optional(),
  status: Joi.string().optional(),
  description: Joi.string().optional(),
  responsibilities: Joi.string().optional(),
  qualifications: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  department: Joi.string().custom(joiObjectIdValidator('department')).optional(),
});
