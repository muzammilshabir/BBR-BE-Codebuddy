import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';
import { ChangeRankingScore } from '../enum/change-ranking-score.enum';

export class ChangeRankingScoreDto {
  @ApiProperty({
    description: 'ID of the ranking category',
    example: '60d7fe6f9eb1f24a04d65633',
    required: true,
  })
  rankingRequestId: Types.ObjectId;

  @ApiProperty({
    description: 'New position of ranging request',
    example: 1,
    required: true,
  })
  newPosition: number;

  @ApiProperty({
    example: ChangeRankingScore.INCREASE,
    enum: ChangeRankingScore,
    description: 'Change ranking of ranking Request',
    required: true,
  })
  changeRankingScore: ChangeRankingScore;
}

export const changeRankingScoreSchema = Joi.object({
  rankingRequestId: Joi.string().required().custom(joiObjectIdValidator('rankingRequestId')),
  newPosition: Joi.number().required().min(0),
  changeRankingScore: Joi.string()
    .valid(...Object.values(ChangeRankingScore))
    .required(),
});
