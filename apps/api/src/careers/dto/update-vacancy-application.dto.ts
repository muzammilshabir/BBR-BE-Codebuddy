import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ApplicationStatus } from '../enum/career.enum';

export class UpdateVacancyApplicationDto {

  @ApiProperty({
    example: ApplicationStatus.REJECTED,
    type: String,
  })
  status: ApplicationStatus;
}

export const updateVacancyApplicationDtoSchema = Joi.object({
  title: Joi.string().required(),
});
