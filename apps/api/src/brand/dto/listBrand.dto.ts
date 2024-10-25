import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { BrandStatus } from '../enum/brand-enum';

export const listBrandSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  brandCategoryId: Joi.string().custom(joiObjectIdValidator('brandCategoryId')).optional(),
  status: Joi.string()
    .valid(...Object.values(BrandStatus))
    .optional(),
});

export class ListBrandDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by brand name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by brandCategoryId',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  brandCategoryId?: string;

  @ApiProperty({
    example: BrandStatus.ACTIVE,
    enum: BrandStatus,
    description: 'The status of the brand',
    required: false,
  })
  status?: BrandStatus;
}
