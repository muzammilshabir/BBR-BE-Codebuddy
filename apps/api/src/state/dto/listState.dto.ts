import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listStateSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListStateDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by State',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}
