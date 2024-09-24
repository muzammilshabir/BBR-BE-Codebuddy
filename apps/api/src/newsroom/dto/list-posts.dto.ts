import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListNewsroomPostsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by Post Title/Contents',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listNewsroomPostsSchema = PaginationSchema.append({
  search: Joi.string().optional(),
});
