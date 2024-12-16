import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { FileType, ResidenceStatus } from '../enum/residence-enum';

export class ListResidenceDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by Location ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  locationId?: string;

  @ApiProperty({
    description: 'Search by residence name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: true,
  })
  status: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    description: 'Set to true if you want to download the data',
    example: false,
    required: false,
    default: false,
  })
  isDownload?: boolean = false;

  @ApiProperty({
    description: 'File type for download (excel or csv)',
    example: FileType.EXCEL,
    enum: FileType,
    required: false,
  })
  fileType?: FileType;

  @ApiProperty({
    example: false,
    required: false,
    default: false,
  })
  featured?: boolean = false;
}

export const listResidenceSchema = PaginationSchema.append({
  locationId: Joi.string().custom(joiObjectIdValidator('locationId')).optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  search:Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .required(),
  isDownload: Joi.boolean().default(false).optional(),
  fileType: Joi.string()
    .valid(...Object.values(FileType))
    .optional(),

  featured: Joi.boolean().default(false).optional(),
});

export class ListResidenceByFiltersQueryPropsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by residence name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export class ListResidenceByFiltersDto {
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
    description: 'Filter by country IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  countryId?: string;
  
  @ApiProperty({
    description: 'Filter by state IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  stateId?: string;

  @ApiProperty({
    description: 'Filter by lifestyle IDs',
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
    description: 'Filter by Pet Policy',
    example: ['No Pets Allowed', 'Pet Friendly'],
    required: false,
    type: [String],
  })
  petPolicy?: string[];

  @ApiProperty({
    description: 'Filter by Property Type IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  propertyTypes?: string[];

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: true,
  })
  status?: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    description: 'Filter by Feature ID',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  featureIds?: string[];

  @ApiProperty({
    description: 'Filter by Location IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  locationIds?: string[];

  @ApiProperty({
    description: 'Filter by development status',
    example: ['under_construction', 'ready_to_move'],
    required: false,
    type: [String],
  })
  developmentStatus?: string[];

  @ApiProperty({
    description: 'Filter by rental potential',
    example: ['high', 'medium', 'low'],
    required: false,
    type: [String],
  })
  rentalPotential?: string[];

  @ApiProperty({
    description: 'Filter by Amenity IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  amenitiesList?: string[];

  @ApiProperty({
    description: 'Filter by Floor Area SqFt',
    example: [50000, 60000],
    required: false,
    type: [Number],
  })
  floorAreaSqFt?: number[];

  @ApiProperty({
    description: 'Filter by Year of Build',
    example: [2010, 2022],
    required: false,
    type: [Number],
  })
  yearOfBuild?: number[];


  @ApiProperty({
    description: 'Filter by price ranges',
    example: [{ startRange: 100000, endRange: 500000 }],
    required: false,
    type: [Object],
  })
  priceRange?: { startRange: number; endRange: number }[];

  @ApiProperty({
    description: 'Filter by Room Count Range',
    example: [{ minRooms: 2, maxRooms: 4 }],
    required: false,
    type: [Object],
  })
  roomCountRange?: { minRooms: number; maxRooms: number }[];
}

export const listResidenceByFiltersSchema = Joi.object({
  roomCountRange: Joi.array()
    .items(Joi.object({
      minRooms: Joi.number().required(),
      maxRooms: Joi.number().required()
    }))
    .optional(),
  cities: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('cities')))
    .optional(),
  geographicalAreasId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('geographicalAreasId')))
    .optional(),
  countryId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('countryId')))
    .optional(),
  stateId: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('stateId')))
    .optional(),
  lifestyles: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('lifestyles')))
    .optional(),
  brands: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('brands')))
    .optional(),
  propertyTypes: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('propertyTypes')))
    .optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .optional(),
  locationIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('locationIds')))
    .optional(),
  featureIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('featureIds')))
    .optional(),
  developmentStatus: Joi.array()
    .items(Joi.string())
    .optional(),
  rentalPotential: Joi.array()
    .items(Joi.string())
    .optional(),
  petPolicy: Joi.array()
    .items(Joi.string())
    .optional(),
  floorAreaSqFt: Joi.array()
    .items(Joi.number())
    .optional(),
  amenitiesList: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('amenitiesList')))
    .optional(),
  yearOfBuild: Joi.array()
    .items(Joi.number())
    .optional(),
  priceRange: Joi.array().items(
    Joi.object({
      startRange: Joi.number().min(0).required(),
      endRange: Joi.number().min(0).greater(Joi.ref('startRange')).required()
    })
  ).optional(),
});

export class ListResidenceWithDraftDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by residence name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: false,
  })
  status?: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    description: 'Filter by brand ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  brandId?: string;
}

export class ListTopResidencesDto extends ListPropsDto {
  @ApiProperty({
    default: 'highestBbrScore',
    required: false,
    enum: ['highestBbrScore'],
    type: String,
  })
  sortBy: 'highestBbrScore';

  @ApiProperty({
    default: 'desc',
    required: false,
    enum: ['desc'],
    type: String,
  })
  sortOrder: 'desc';

  @ApiProperty({
    description: 'Filter by country ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  countryId?: string;
}

export const listTopResidencesSchema = PaginationSchema.append({
  sortOrder: Joi.string().valid('desc').default('desc'),
  sortBy: Joi.string().valid('highestBbrScore').default('highestBbrScore'),
  countryId: Joi.string().custom(joiObjectIdValidator('countryId')).optional(),
});

export class ListResidenceWithDraftCountDto {
  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;
}
