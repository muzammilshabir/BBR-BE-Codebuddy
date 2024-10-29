import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListExclusiveOfferDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by Property Type IDs',
    example: ['60b6c0f53b5a5c1f88d25a1b'],
    required: false,
    type: [String],
  })
  propertyTypes?: string[];

  @ApiProperty({
    description: 'Search by unit name and number',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listExclusiveOfferDtoSchema = PaginationSchema.append({
  propertyTypes: Joi.array()
    .items(Joi.string().custom(joiObjectIdValidator('propertyTypes')))
    .optional(),
  search: Joi.string().optional(),
});
