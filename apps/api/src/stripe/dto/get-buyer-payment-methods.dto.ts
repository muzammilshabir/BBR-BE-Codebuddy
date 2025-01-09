import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetBuyerPaymentMethodsDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Buyer ID',
    required: true,
  })
  buyerId: string;
}

export const getBuyerPaymentMethodsDtoSchema = Joi.object({
  buyerId: Joi.string().custom(joiObjectIdValidator('buyerId')).required(),
});
