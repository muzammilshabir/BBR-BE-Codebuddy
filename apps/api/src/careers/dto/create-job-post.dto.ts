import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { JobStatus, JobType } from '../enum/career.enum';


export class CreateJobPostDto {

  @ApiProperty({
    example: 'Sales Executive',
    required: true,
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'customer service role',
    required: true,
    type: String,
  })
  tagLine: string;

  @ApiProperty({
    example: false,
    required: true,
    default: false,
    type: Boolean,
  })
  isRemote: string;

  @ApiProperty({
    example: 'Paris, France',
    required: true,
    description: `Use this API to get locations https://maps.googleapis.com/maps/api/place/autocomplete/json?input=USER_INPUT_HERE&types=geocode&key=YOUR_API_KEY`,
    type: String,
  })
  location: string;

  @ApiProperty({
    example: JobType.FULL_TIME,
    required: true,
    enum: JobType,
  })
  type: JobType;

  @ApiProperty({
    example: JobStatus.ACTIVE,
    required: true,
    enum: JobStatus,
  })
  status: JobStatus;

  @ApiProperty({ example: '66acda8b857c576159b741a2', required: true })
  jobPicture: Types.ObjectId;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: true,
    type: String,
  })
  description: string;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: true,
    type: String,
  })
  responsibilities: string;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: true,
    type: String,
  })
  qualifications: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/test',
    required: false,
    type: String,
  })
  linkedin?: string;

  @ApiProperty({
    example: ['CRM', 'MS Office'],
    required: false,
    type: Array<string>,
  })
  skills: string[];

  @ApiProperty({ example: '66acda8b857c576159b744a2', required: true })
  department: Types.ObjectId;

  @ApiProperty({
    example: Date.now(),
    required: true,
    type: Date,
  })
  postedOn: Date;
}

export const createJobPostDtoSchema = Joi.object({
  title: Joi.string().required(),
  tagLine: Joi.string().required(),
  isRemote: Joi.boolean().default(false).required(),
  location: Joi.string().required(),
  jobPicture: Joi.string().custom(joiObjectIdValidator('jobPicture')).required(),
  type: Joi.string().required(),
  status: Joi.string().required(),
  description: Joi.string().required(),
  responsibilities: Joi.string().required(),
  qualifications: Joi.string().required(),
  linkedin: Joi.string().regex(
    /https?:\/\/(www\.)?linkedin\.com\/in\/([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/
  ).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  department: Joi.string().custom(joiObjectIdValidator('department')).required(),
  postedOn: Joi.date().required(),
});
