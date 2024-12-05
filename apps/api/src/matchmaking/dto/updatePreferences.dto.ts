import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class MatchmakingPreferencesDto {
  @ApiProperty({
    description: 'Filter by Location IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  locationIds?: string[];

  @ApiProperty({
    description: 'Filter by Amenity IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  amenities?: string[];

  @ApiProperty({
    description: 'Filter by Brand IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  brands?: string[];

  @ApiProperty({
    description: 'Filter by Lifestyle IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  lifestyles?: string[];

  @ApiProperty({
    description: 'Filter by Property Type IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  propertyTypes?: string[];

  @ApiProperty({
    description: 'Minimum price',
    example: 100000,
    required: false,
    type: Number,
  })
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    example: 500000,
    required: false,
    type: Number,
  })
  maxPrice?: number;

  @ApiProperty({
    description: 'Development status options',
    example: ['under_construction', 'ready_to_move'],
    required: false,
    type: [String],
  })
  developmentStatus?: string[];

  @ApiProperty({
    description: 'Rental potential options',
    example: ['high', 'medium', 'low'],
    required: false,
    type: [String],
  })
  rentalPotential?: string[];
}

export const matchmakingPreferencesSchema = Joi.object({
  locationIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('locationIds')))
    .optional(),

  amenities: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('amenities')))
    .optional(),

  brands: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('brands')))
    .optional(),

  lifestyles: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('lifestyles')))
    .optional(),

  propertyTypes: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('propertyTypes')))
    .optional(),

  minPrice: Joi.number()
    .min(0)
    .optional(),

  maxPrice: Joi.number()
    .min(0)
    .greater(Joi.ref('minPrice'))
    .optional(),

  developmentStatus: Joi.array()
    .items(Joi.string())
    .optional(),

  rentalPotential: Joi.array()
    .items(Joi.string())
    .optional(),
});