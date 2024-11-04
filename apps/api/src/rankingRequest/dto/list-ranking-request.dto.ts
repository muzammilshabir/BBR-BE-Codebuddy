import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RankingRequestStatus } from '../enum/rankingRequest-status.enum';
import { PaymentStatus } from '../enum/payment-status.enum';
import { FileType } from '../../residences/enum/residence-enum';
import { joiObjectIdValidator } from '../../../../../packages/api-core/modules/custome-validations/custome-validations';
import { CategoryType } from '../../rankingCategory/enum/category-type.enum';

export class ListRankingRequestDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ranking request name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: RankingRequestStatus.ACTIVE,
    enum: RankingRequestStatus,
    description: 'The status of the ranking Request',
    required: false,
  })
  status?: RankingRequestStatus;

  @ApiProperty({
    example: PaymentStatus.PAID,
    enum: PaymentStatus,
    description: 'The payment status of the ranking Request',
    required: false,
  })
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    example: CategoryType.CITY,
    enum: CategoryType,
    description: 'Ranking category type',
    required: false,
  })
  categoryType?: CategoryType;

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
    description: 'Filter by ranking category ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  rankingCategoryId?: string;
}

export const listRankingRequestSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(RankingRequestStatus))
    .optional(),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  rankingCategoryId: Joi.string().custom(joiObjectIdValidator('rankingCategoryId')).optional(),
  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .optional(),
  isDownload: Joi.boolean().default(false).optional(),
  fileType: Joi.string()
    .valid(...Object.values(FileType))
    .optional(),
});

export class ListRankingRequestWithDraftDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ranking request name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: RankingRequestStatus.ACTIVE,
    enum: RankingRequestStatus,
    description: 'The status of the ranking request',
    required: false,
  })
  status?: RankingRequestStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;
}

export class ListTop10RankedResidenceDto {
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
}

export const listTop10RankedResidenceDto = Joi.object({
  isDownload: Joi.boolean().default(false).optional(),
  fileType: Joi.string()
    .valid(...Object.values(FileType))
    .optional(),
});

export class ListRankingRequestForUserDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ranking request name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: CategoryType.CITY,
    enum: CategoryType,
    description: 'Ranking category type',
    required: false,
  })
  categoryType?: CategoryType;

  @ApiProperty({
    description: 'Filter by ranking category ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  rankingCategoryId?: string;

  @ApiProperty({
    description: 'Filter by ranking residence types',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  residenceTypeIds?: string[];

  @ApiProperty({
    description: 'Filter by ranking lifeStyles',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  lifeStyleIds?: string[];

  @ApiProperty({
    description: 'Filter by ranking brands',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  brandIds?: string[];
}

export const listRankingRequestForUserSchema = PaginationSchema.append({
  search: Joi.string().optional(),

  categoryType: Joi.string()
    .valid(...Object.values(CategoryType))
    .optional(),

  rankingCategoryId: Joi.string().custom(joiObjectIdValidator('rankingCategoryId')).optional(),

  residenceTypeIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('residenceTypeId')))
    .optional(),

  lifeStyleIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('lifeStyleId')))
    .optional(),

  brandIds: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('brandId')))
    .optional(),
});
