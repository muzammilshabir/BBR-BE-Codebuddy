import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { LeadSource } from '../enum/lead-enum';

export class CreateLeadDto {
  @ApiProperty({ example: 'John Doe', required: true })
  name: string;

  @ApiProperty({ example: '+123456789', required: true })
  phoneNumber: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: false, type: String })
  unitId?: Types.ObjectId;

  @ApiProperty({ example: 'https://dummywebsite.com/lead-page', required: false })
  pageUrl?: string;

  @ApiProperty({ example: 'USA', required: false })
  country?: string;

  @ApiProperty({
    example: LeadSource.WEBSITE_FORM,
    enum: LeadSource,
    required: false,
  })
  source?: LeadSource;
}

export const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  residenceId: Joi.string().optional().custom(joiObjectIdValidator('residenceId')),
  unitId: Joi.string().optional().custom(joiObjectIdValidator('unitId')),
  pageUrl: Joi.string().optional(),
  country: Joi.string().optional(),
  source: Joi.string()
    .valid(...Object.values(LeadSource))
    .optional(),
});
