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
}

export const listResidenceByFiltersSchema = Joi.object({
  cities: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('cities')))
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
