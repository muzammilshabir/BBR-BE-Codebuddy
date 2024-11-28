import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateAdminNoteDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2b', required: true })
  customerSupportId: string;

  @ApiProperty({ example: 'Customer Interaction', required: true })
  title: string;

  @ApiProperty({ example: 'Detailed discussion about service', required: false })
  description?: string;
}

export const createAdminNoteSchema = Joi.object({
  customerSupportId: Joi.string().required().custom(joiObjectIdValidator('customerSupportId')),
  title: Joi.string().required(),
  description: Joi.string().optional(),
}); 