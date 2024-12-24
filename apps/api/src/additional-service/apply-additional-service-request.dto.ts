import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { Types } from 'mongoose';
import { VerificationType } from 'src/bbr-verification/enum/verification-type.enum';

export const applyAdditionalServiceRequestSchema = Joi.object({
  bbrVerificationPlanId: Joi.string()
    .custom(joiObjectIdValidator('bbrVerificationPlanId'))
    .optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  verificationType: Joi.string()
    .valid(...Object.values(VerificationType))
    .optional(),
  residencePlanId: Joi.string().custom(joiObjectIdValidator('residencePlanId')).optional(),
  rankingCategoryIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('rankingCategoryId')))
    .optional(),
  featurePlanId: Joi.string().custom(joiObjectIdValidator('featurePlanId')).optional(),
  // TODO: May be used later
  // stripePmTokenId: Joi.string().required(),
  userDetails: Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
});

export class UserInfoForAdditionalServiceDto {
  @ApiProperty({
    description: 'Full name',
    type: String,
  })
  fullName: string;

  @ApiProperty({
    description: 'Email',
    type: String,
    example: 'test@test.com',
  })
  email: string;
}

export class ApplyAdditionalServiceRequestDto {
  @ApiProperty({
    description: 'BBR verification request ID',
    type: Types.ObjectId,
    required: false,
    example: '60d5f485f7c6a4b2b8e8b623',
  })
  bbrVerificationPlanId?: Types.ObjectId;

  @ApiProperty({
    description: 'Residence plan ID',
    type: Types.ObjectId,
    required: false,
    example: '60d5f485f7c6a4b2b8e8b623',
  })
  residencePlanId?: Types.ObjectId;

  @ApiProperty({
    description: 'Ranking category IDs',
    type: [String],
    required: false,
    example: ['60d5f485f7c6a4b2b8e8b623', '60d5f485f7c6a4b2b8e8b623'],
  })
  rankingCategoryIds?: string[];

  @ApiProperty({
    description: 'Feature request ID',
    type: Types.ObjectId,
    required: false,
    example: '60d5f485f7c6a4b2b8e8b623',
  })
  featurePlanId?: Types.ObjectId;

  @ApiProperty({
    description: 'Residence ID',
    type: Types.ObjectId,
    required: false,
    example: '60d5f485f7c6a4b2b8e8b623',
  })
  residenceId?: Types.ObjectId;

  @ApiProperty({
    enum: VerificationType,
    required: false,
    description: 'Type of verification',
    example: VerificationType.E_VERIFICATION,
  })
  verificationType?: VerificationType;

  @ApiProperty({
    description: 'User details',
    type: UserInfoForAdditionalServiceDto,
  })
  userDetails: UserInfoForAdditionalServiceDto;

  // TODO: May be used later
  // @ApiProperty({
  //   description: 'Stripe payment method token ID',
  //   type: String,
  //   required: true,
  // })
  // stripePmTokenId: string;
}
