import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listResidenceTypeSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListResidenceTypeDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by ResidenceType type',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}