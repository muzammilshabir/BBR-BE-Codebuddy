import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateCareerDepartmentDto {

  @ApiProperty({
    example: 'Sales',
    required: true,
    type: String,
  })
  title: string;
}

export const createCareerDepartmentDtoSchema = Joi.object({
  title: Joi.string().required(),
});
