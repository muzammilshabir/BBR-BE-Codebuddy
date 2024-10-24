import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const getBrandByIdSchema = Joi.object({
  brandId: Joi.string().custom(joiObjectIdValidator('brandId')).required(),
});

export class GetBrandByIdDto {
  @ApiProperty({
    description: 'The ID of the brand  to retrieve',
    example: '64b9b23e47a010ab41b58913',
    required: true,
    type: String,
  })
  brandId: string;
}
