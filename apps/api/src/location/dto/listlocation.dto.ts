import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';
import { isValidObjectId } from '@bbr/api-core/modules/custome-validations/custome-validations'; 

export const listLocationSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  locationFilter: Joi.string().valid('country', 'city').optional(),
  parentId: Joi.string()
  .custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.message({ custom: 'Invalid ObjectId' });
    }
    return value;
  }).optional(),
});

export class ListLocationDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by location name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    enum: ['country', 'city'],
    required: false,
    examples: {
      country: { value: 'country' },
      city: { value: 'city' },
    },
    type: String,
  })
  locationFilter?: string;

  @ApiProperty({
    description: 'Filter by parentId',
    example: '60d21b4667d0d8992e610c85',
    required: false,
    type: String,
  })
  parentId?: string;
}