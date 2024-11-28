import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
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
    description: 'Search by date range',
    example: new Date(),
    required: false,
    type: Date,
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Search by date range',
    example: new Date(),
    required: false,
    type: Date,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Search by lead name, country, or residence name',
    example: 'John',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter leads by registered users',
    example: true,
    required: false,
  })
  isRegistered?: boolean;
}

export const listListSchema = PaginationSchema.append({
  status: Joi.string()
    .valid(...Object.values(LeadStatus))
    .optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  search: Joi.string().optional(),
  isRegistered: Joi.boolean().optional(),
});
