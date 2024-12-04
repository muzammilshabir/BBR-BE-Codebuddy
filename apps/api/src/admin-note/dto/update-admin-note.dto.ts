import * as Joi from 'joi';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminNoteDto {
  @ApiProperty({ example: 'Customer Interaction', required: false })
  title?: string;

  @ApiProperty({ example: 'Detailed discussion about service', required: false })
  description?: string;
}

export const updateAdminNoteSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
});
