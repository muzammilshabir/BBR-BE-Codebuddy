import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class CreateClaimRequestDto {
  @ApiProperty({ example: 'John Doe', required: true })
  userName: string;

  @ApiProperty({ example: 'johndoe@example.com', required: true })
  email: string;

  @ApiProperty({
    example: { countryCode: '+1', number: '1234567890' },
    required: true,
    type: Object,
  })
  phoneNumber: {
    countryCode: string;
    number: string;
  };

  @ApiProperty({ example: 'John Doe Real Estate', required: true })
  companyName: string;

  @ApiProperty({ example: 'https://johndoerealestate.com', required: true })
  companyWebsite: string;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a3b', required: false, type: String })
  unitId?: Types.ObjectId;

  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  documents: Types.ObjectId[];

  @ApiProperty({ example: true, required: false })
  acceptBBRCommitment: boolean;

  @ApiProperty({ example: true, required: false })
  receiveLuxuryInsights: boolean;
}

export class CreateClaimResidenceForDeveloperWithMatchingDomainDto {
  @ApiProperty({ example: 'johndoe@example.com', required: true })
  email: string;

  @ApiProperty({
    example: { countryCode: '+1', number: '1234567890' },
    required: true,
    type: Object,
  })
  phoneNumber: {
    countryCode: string;
    number: string;
  };

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: false, type: String })
  residenceId?: Types.ObjectId;

  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a3b', required: false, type: String })
  unitId?: Types.ObjectId;
}

// Joi validation schema
export const createClaimRequestSchema = Joi.object({
  userName: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.object({
    countryCode: Joi.string().required(),
    number: Joi.string().required(),
  }).required(),
  companyName: Joi.string().required(),
  companyWebsite: Joi.string().uri().required(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  unitId: Joi.string().custom(joiObjectIdValidator('unitId')).optional(),
  documents: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('documents')))
    .required(),
  acceptBBRCommitment: Joi.boolean().optional(),
  receiveLuxuryInsights: Joi.boolean().optional(),
})
  .xor('residenceId', 'unitId') // Enforces that only one of residenceId or unitId is passed
  .messages({
    'object.missing': 'At least one of residenceId or unitId must be provided.',
    'object.xor': 'Only one of residenceId or unitId can be provided at a time.',
  });

export const createClaimResidenceForDeveloperWithMatchingDomainDtoSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.object({
    countryCode: Joi.string().required(),
    number: Joi.string().required(),
  }).required(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  unitId: Joi.string().custom(joiObjectIdValidator('unitId')).optional(),
})
  .xor('residenceId', 'unitId') // Enforces that only one of residenceId or unitId is passed
  .messages({
    'object.missing': 'At least one of residenceId or unitId must be provided.',
    'object.xor': 'Only one of residenceId or unitId can be provided at a time.',
  });
