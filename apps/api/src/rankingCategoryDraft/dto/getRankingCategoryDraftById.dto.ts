import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetRankingCategoryDraftByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Ranking Category',
    required: true,
  })
  id: string;
}

export const getRankingCategoryDraftByIdSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
});
