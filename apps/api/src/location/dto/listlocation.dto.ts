import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listLocationSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  locationFilter: Joi.string().valid('country', 'city').optional(),
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
}