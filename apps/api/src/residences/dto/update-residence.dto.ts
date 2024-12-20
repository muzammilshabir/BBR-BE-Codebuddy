import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import {
  Address,
  BriefOverview,
  BudgetLimitationsRange,
  ComprehensiveOverview,
} from './create-residence.dto';
import { ResidenceStatus } from '../enum/residence-enum';

export class UpdateResidenceDto {
  @ApiProperty({ example: 'Ritz Carlton Miami', required: false })
  name?: string;

  @ApiProperty({
    example: ['60d9c6a0a11c3c6c6a9a1a2a', '60d9c6a0a11c3c6c6a9a1b3c'],
    required: false,
    type: [String],
    description: 'Array of residence type IDs',
  })
  residenceTypeIds?: Types.ObjectId[];

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1a', required: false, type: String })
  locationId?: Types.ObjectId;

  @ApiProperty({ example: 'https://dummywebsite.com', required: false })
  websiteLink?: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a1b', required: false, type: String })
  associatedBrandId?: Types.ObjectId;

  @ApiProperty({ required: false })
  briefOverview?: BriefOverview;

  @ApiProperty({ required: false })
  comprehensiveOverview?: ComprehensiveOverview;

  @ApiProperty({ required: false })
  budgetLimitationsRange?: BudgetLimitationsRange;

  @ApiProperty({ required: false })
  address: Address;

  @ApiProperty({ required: false })
  status: ResidenceStatus.ACTIVE;
}

export const updateResidenceSchema = Joi.object({
  name: Joi.string().optional(),
  residenceTypeIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('residenceTypeIds')))
    .optional(),
  locationId: Joi.string().optional().custom(joiObjectIdValidator('locationId')),
  websiteLink: Joi.string().optional(),
  associatedBrandId: Joi.string().optional().custom(joiObjectIdValidator('associatedBrandId')),
  briefOverview: Joi.object({
    subtitle: Joi.string().optional(),
    briefDescription: Joi.string().optional(),
  }).optional(),
  comprehensiveOverview: Joi.object({
    subtitle: Joi.string().optional(),
    generalDescription: Joi.string().optional(),
    community: Joi.string().optional(),
    recentRenovation: Joi.string().optional(),
    localAttractions: Joi.string().optional(),
    futureDevelopmentPlans: Joi.string().optional(),
  }).optional(),
  budgetLimitationsRange: Joi.object({
    startRange: Joi.number().optional(),
    endRange: Joi.number().optional(),
  }).optional(),
  address: Joi.object({
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().required(),
    userInput: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
    placeId: Joi.string().optional(),
  }).optional(),
  status: Joi.string().optional(),
});

export class RejectResidenceDto {
  @ApiProperty({
    description: 'The resone for the rejection',
    example: 'Invalid documents',
    required: true,
  })
  rejectionReason: string;
}

export const rejectResidenceSchema = Joi.object({
  rejectionReason: Joi.string().required(),
});

export class UpdateResidenceStatusDto {
  @ApiProperty({
    description: 'New status of the residence',
    enum: ResidenceStatus,
    example: ResidenceStatus.ARCHIVED,
  })
  status: ResidenceStatus;
}

// Joi validation schema excluding the unwanted statuses
export const updateResidenceStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      ResidenceStatus.PENDING,
      ResidenceStatus.SOLD,
      ResidenceStatus.PENDINGIMAGEAPPROVAL,
      ResidenceStatus.INACTIVE,
      ResidenceStatus.BILLINGISSUE,
      ResidenceStatus.SUSPENDED,
      ResidenceStatus.ARCHIVED,
      ResidenceStatus.DELETED
    )
    .required(),
});

export class UpdateFeaturedDto {
  @ApiProperty({
    description: 'ID of the residence to update',
    example: '60b6c0f53b5a5c1f88d25a1b',
    type: String,
  })
  residenceId: string;

  @ApiProperty({
    description: 'Set residence as featured or not',
    example: true,
    type: Boolean,
  })
  featured: boolean;
}

export const updateFeaturedSchema = Joi.object({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  featured: Joi.boolean().required(),
});

export class UpdateResidenceProfileDto {
  @ApiProperty({
    description: 'ID of plan',
    example: '60b6c0f53b5a5c1f88d25a1b',
    type: String,
  })
  planId: string;

  @ApiProperty({
    description: 'Set subscription not',
    example: '60b6c0f53b5a5c1f88d25a1b',
    type: String,
  })
  subscriptionId?: string;
}

export const updateResidenceProfileSchema = Joi.object({
  planId: Joi.string().custom(joiObjectIdValidator('planId')).required(),
  subscriptionId: Joi.string().custom(joiObjectIdValidator('subscriptionId')).optional(),
});
