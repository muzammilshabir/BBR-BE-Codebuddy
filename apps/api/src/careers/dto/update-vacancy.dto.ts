import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';


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
    example: 'Lorem ipsum dolor sit ...',
    type: String,
  })
  description?: string;

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
  description: Joi.string().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  department: Joi.string().custom(joiObjectIdValidator('department')).optional(),
});
