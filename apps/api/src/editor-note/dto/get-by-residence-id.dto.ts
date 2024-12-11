import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetByResidenceIdDto {
  @ApiProperty({
    description: 'Residence id',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: true,
    type: String,
  })
  residenceId: string;
}

export const getByResidenceIdSchema = PaginationSchema.append({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
});
