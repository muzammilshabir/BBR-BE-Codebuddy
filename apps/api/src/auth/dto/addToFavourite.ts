import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export enum PropertyType {
  UNIT = 'unit',
  RESIDENCE = 'residence',
}

export class AddFavouritesDto {
  @ApiProperty({
    example: PropertyType.RESIDENCE,
    enum: PropertyType,
    required: true,
  })
  propertyType: PropertyType;

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: true,
  })
  favouriteId: string;
}

export const addFavouritesSchema = Joi.object({
  favouriteId: Joi.string().custom(joiObjectIdValidator('favouriteIds')).required(),
  propertyType: Joi.string()
    .valid(...Object.values(PropertyType))
    .required(),
});

export class ListFavouritesDto extends ListPropsDto {
  @ApiProperty({
    example: PropertyType.RESIDENCE,
    enum: PropertyType,
    description: 'favourites (unit/residence)',
    required: true,
  })
  propertyType: PropertyType;

  @ApiProperty({
    description: 'Search by residence name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const getFavouritesSchema = PaginationSchema.append({
  propertyType: Joi.string().valid('unit', 'residence').required(),
  search: Joi.string().optional(),
});
