import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const getBrandByIdSchema = Joi.object({ brandId: Joi.string().required() });

export class GetBrandByIdDto {
  @ApiProperty({
    description: 'The ID of the brand  to retrieve',
    example: '64b9b23e47a010ab41b58913',
    required: true,
    type: String,
  })
  brandId: string;
}
