import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listCountrySchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListCountryDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Country',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}
