import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';
import { RankingImprovementOption } from '../enum/ranking-improvement-option.enum';

export class ImproveRankingRequestDto {
  @ApiProperty({
    description: 'Ranking improvement option',
    example: RankingImprovementOption.AUTOMATED_FEEDBACK,
    enum: RankingImprovementOption,
    required: true,
  })
  rankingImprovementOption: RankingImprovementOption;

  @ApiProperty({
    description: 'Array of upload objects',
    example: [{ ImageId: '60d7fe6f9eb1f24a04d65633', type: 'docs' }],
    required: false,
    type: Array,
  })
  upload?: Array<{
    ImageId: Types.ObjectId;
    type?: string;
  }>;
}

export const improveRankingRequestSchema = Joi.object({
  rankingImprovementOption: Joi.string()
    .valid(...Object.values(RankingImprovementOption))
    .required(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        type: Joi.string().optional(),
      })
    )
    .optional(),
});
