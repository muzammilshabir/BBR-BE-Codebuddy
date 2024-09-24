import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listResidenceServiceSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListResidenceServiceDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Residence service',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}
