import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetUnitByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Unit',
    required: true,
  })
  unitId: string;
}

export const getUnitByIdSchema = Joi.object({
  unitId: Joi.string().custom(joiObjectIdValidator('unitId')).required(),
});
