import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateVacancyDepartmentDto {

  @ApiProperty({
    example: 'Sales',
    type: String,
  })
  title?: string;
}

export const updateVacancyDepartmentDtoSchema = Joi.object({
  title: Joi.string().optional(),
});
