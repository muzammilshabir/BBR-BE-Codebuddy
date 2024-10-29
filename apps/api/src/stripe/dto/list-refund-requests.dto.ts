import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListRefundRequestsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by refund request info',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listRefundRequestsDtoSchema = PaginationSchema.append({
  search: Joi.string().optional(),
});
