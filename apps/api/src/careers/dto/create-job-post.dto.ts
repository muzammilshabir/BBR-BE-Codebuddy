import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';


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
    example: 'Lorem ipsum dolor sit ...',
    required: true,
    type: String,
  })
  description: string;

  @ApiProperty({
    example: ['CRM', 'MS Office'],
    required: false,
    type: Array<string>,
  })
  skills: string[];

  @ApiProperty({ example: '66acda8b857c576159b744a2', required: true })
  department: Types.ObjectId;
}

export const createJobPostDtoSchema = Joi.object({
  title: Joi.string().required(),
  tagLine: Joi.string().required(),
  description: Joi.string().required(),
  skills: Joi.array().items(Joi.string()).optional(),
  department: Joi.string().custom(joiObjectIdValidator('department')).required(),
});
