import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { RankingRequestStatus } from '../enum/rankingRequest-status.enum';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';

export class UpdateRankingRequestDto {
  @ApiProperty({
    description: 'Array of criteria scores',
    example: [
      {
        criteriaId: '603d2f7f5d9a3c45f4f4b1e1',
        score: 85,
      },
    ],
    required: false,
    type: Array,
  })
  criteriaScores?: {
    criteriaId: Types.ObjectId;
    score: number;
    description?: string;
  }[];

  @ApiProperty({
    description: 'Notification preferences for the ranking request',
    required: false,
    type: Object,
    example: {
      disableAllNotifications: false,
      moveUpInRankings: { enabled: true, positions: 2 },
      moveDownInRankings: { enabled: false, positions: 1 },
      rankingCriteriaChanged: true,
      rankingCriteriaChangeUpdated: false,
      rankingCriteriaChangeDowngraded: true,
      becomesTopPerformer: false,
      competitorSurpassedRanking: true,
      notifyVia: { push: true, email: false, whatsapp: true },
    },
  })
  notification?: {
    disableAllNotifications?: boolean;
    moveUpInRankings?: { enabled: boolean; positions: number };
    moveDownInRankings?: { enabled: boolean; positions: number };
    rankingCriteriaChanged?: boolean;
    rankingCriteriaChangeUpdated?: boolean;
    rankingCriteriaChangeDowngraded?: boolean;
    becomesTopPerformer?: boolean;
    competitorSurpassedRanking?: boolean;
    notifyVia?: { push: boolean; email: boolean; whatsapp: boolean };
  };
}

export const updateRankingRequestSchema = Joi.object({
  criteriaScores: Joi.array()
    .items(
      Joi.object({
        criteriaId: Joi.string().required().custom(joiObjectIdValidator('criteriaId')),
        score: Joi.number().required().min(0).max(100),
        description: Joi.string().optional(),
      })
    )
    .min(1)
    .optional(),
  notification: Joi.object({
    disableAllNotifications: Joi.boolean().optional(),
    moveUpInRankings: Joi.object({
      enabled: Joi.boolean().optional(),
      positions: Joi.number().optional(),
    }).optional(),
    moveDownInRankings: Joi.object({
      enabled: Joi.boolean().optional(),
      positions: Joi.number().optional(),
    }).optional(),
    rankingCriteriaChanged: Joi.boolean().optional(),
    rankingCriteriaChangeUpdated: Joi.boolean().optional(),
    rankingCriteriaChangeDowngraded: Joi.boolean().optional(),
    becomesTopPerformer: Joi.boolean().optional(),
    competitorSurpassedRanking: Joi.boolean().optional(),
    notifyVia: Joi.object({
      push: Joi.boolean().optional(),
      email: Joi.boolean().optional(),
      whatsapp: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

export class UpdateRankingRequestStatusDto {
  @ApiProperty({
    description: 'New status of the ranking request',
    enum: RankingRequestStatus,
    example: RankingRequestStatus.ARCHIVED,
  })
  status: RankingRequestStatus;
}

export const updateRankingRequestStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      RankingRequestStatus.INACTIVE,
      RankingRequestStatus.ARCHIVED,
      RankingRequestStatus.DELETED,
      RankingRequestStatus.FLAGGED
    )
    .required(),
});
