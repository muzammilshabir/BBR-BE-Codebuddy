import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class MatchmakingPreferencesDto {
  @ApiProperty({
    description: 'Filter by Country IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  countryId?: string[];

  @ApiProperty({
    description: 'Filter by State IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  stateId?: string[];

  @ApiProperty({
    description: 'Filter by City IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  cities?: string[];

  @ApiProperty({
    description: 'Filter by geographical area IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  geographicalAreasId?: string[];

  @ApiProperty({
    description: 'Filter by Property Type IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  propertyTypes?: string[];

  @ApiProperty({
    description: 'Filter by Lifestyle IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  lifestyles?: string[];

  @ApiProperty({
    description: 'Filter by Brand IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  brands?: string[];

  @ApiProperty({
    description: 'Pet policy options',
    example: ['dogs_allowed', 'cats_allowed'],
    required: false,
    type: [String],
  })
  petPolicy?: string[];

  @ApiProperty({
    description: 'Floor area in square feet',
    example: [1000, 2000],
    required: false,
    type: [Number],
  })
  floorAreaSqFt?: number[];

  @ApiProperty({
    description: 'Feature IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  featureIds?: string[];

  @ApiProperty({
    description: 'Year of build options',
    example: [2020, 2023],
    required: false,
    type: [Number],
  })
  yearOfBuild?: number[];

  @ApiProperty({
    description: 'Rental potential options',
    example: ['high', 'medium', 'low'],
    required: false,
    type: [String],
  })
  rentalPotential?: string[];

  @ApiProperty({
    description: 'Development status options',
    example: ['under_construction', 'ready_to_move'],
    required: false,
    type: [String],
  })
  developmentStatus?: string[];

  @ApiProperty({
    description: 'Filter by Amenity IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  amenitiesList?: string[];

  @ApiProperty({
    description: 'Price range',
    example: [{ startRange: 100000, endRange: 500000 }],
    required: false,
    type: [Object],
  })
  priceRange?: { startRange: number; endRange: number }[];

  @ApiProperty({
    description: 'Room count range',
    example: [{ minRooms: 2, maxRooms: 4 }],
    required: false,
    type: [Object],
  })
  roomCountRange?: { minRooms: number; maxRooms: number }[];
}

export const matchmakingPreferencesSchema = Joi.object({
  countryId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('countryId')))
    .optional(),

  stateId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('stateId')))
    .optional(),

  cities: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('cities')))
    .optional(),

  amenitiesList: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('amenitiesList')))
    .optional(),

  brands: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('brands')))
    .optional(),

  lifestyles: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('lifestyles')))
    .optional(),

  geographicalAreasId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('geographicalAreasId')))
    .optional(),

  propertyTypes: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('propertyTypes')))
    .optional(),

  petPolicy: Joi.array().items(Joi.string()).optional(),

  floorAreaSqFt: Joi.array().items(Joi.number().min(0)).optional(),

  featureIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('featureIds')))
    .optional(),

  yearOfBuild: Joi.array().items(Joi.number()).optional(),

  priceRange: Joi.array()
    .items(
      Joi.object({
        startRange: Joi.number().min(0).required(),
        endRange: Joi.number().min(0).greater(Joi.ref('startRange')).required(),
      })
    )
    .optional(),

  roomCountRange: Joi.array()
    .items(
      Joi.object({
        minRooms: Joi.number().min(0).required(),
        maxRooms: Joi.number().min(0).greater(Joi.ref('minRooms')).required(),
      })
    )
    .optional(),

  developmentStatus: Joi.array().items(Joi.string()).optional(),

  rentalPotential: Joi.array().items(Joi.string()).optional(),
});
