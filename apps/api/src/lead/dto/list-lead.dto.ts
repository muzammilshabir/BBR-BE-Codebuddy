import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { LeadSource, LeadStatus } from '../enum/lead-enum';

export class ListLeadDto extends ListPropsDto {
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
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
  search: Joi.string().optional(),
});

export class UpdateLeadDto {
  @ApiProperty({
    example: LeadStatus.NEW,
    enum: LeadStatus,
    description: 'The status of the lead',
    required: true,
  })
  status: LeadStatus;
}

export const updateListSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .required(),
});
