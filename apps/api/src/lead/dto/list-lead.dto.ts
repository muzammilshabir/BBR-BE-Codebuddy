import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { LeadSource, LeadStatus } from '../enum/lead-enum';

export class ListLeadDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by residenceId',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  residenceId?: string;

  @ApiProperty({
    example: LeadStatus.NEW,
    enum: LeadStatus,
    description: 'The status of the lead',
    required: false,
  })
  status?: LeadStatus;

  @ApiProperty({
    example: LeadSource.WEBSITE_FORM,
    enum: LeadSource,
    description: 'The Source of the lead',
    required: false,
  })
  source?: LeadSource;

  @ApiProperty({
    description: 'Search by lead name, country, or residence name',
    example: 'John',
    required: false,
    type: String,
  })
  search?: string;
}

export const listListSchema = PaginationSchema.append({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
  search: Joi.string().optional(),
});
