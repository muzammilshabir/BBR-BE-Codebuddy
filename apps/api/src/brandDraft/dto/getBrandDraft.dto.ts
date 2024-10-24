import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const getBrandDraftByIdSchema = Joi.object({
  brandDraftId: Joi.string().custom(joiObjectIdValidator('brandDraftId')).required(),
});

export class GetBrandDraftByIdDto {
  @ApiProperty({
    description: 'The ID of the brand draft to retrieve',
    example: '64b9b23e47a010ab41b58913',
    required: true,
    type: String,
  })
  brandDraftId: string;
}
