import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';

export const listPostSchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
});

export class ListPostDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Post title,content',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}
