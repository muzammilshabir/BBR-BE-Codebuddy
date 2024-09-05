import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetJobApplicationsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Vacancy Id',
    example: '66acda8b857c576159b74da5',
    required: false,
    type: String,
  })
  vacancyId?: string;
}

export const getJobApplicationsSchema = PaginationSchema.append({
  vacancyId: Joi.string().custom(joiObjectIdValidator('vacancyId')).optional(),
});
