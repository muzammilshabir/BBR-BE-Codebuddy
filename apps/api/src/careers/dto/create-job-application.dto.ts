import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';


export class CreateJobApplicationDto {

  @ApiProperty({
    example: 'John Smith',
    required: true,
    type: String,
  })
  fullName: string;

  @ApiProperty({
    example: 'john@example.com',
    required: true,
    type: String,
  })
  email: string;

  @ApiProperty({
    example: 'NYC',
    required: true,
    type: String,
  })
  location: string;

  @ApiProperty({ example: '66acda8b857c576159b742a2', required: true })
  resume: Types.ObjectId;

  @ApiProperty({ example: '66acda8b857c576159b744a2', required: true })
  vacancy: Types.ObjectId;
}

export const createJobApplicationDtoSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().trim().email().required(),
  location: Joi.string().required(),
  resume: Joi.string().custom(joiObjectIdValidator('resume')).required(),
  vacancy: Joi.string().custom(joiObjectIdValidator('vacancy')).required(),
});
