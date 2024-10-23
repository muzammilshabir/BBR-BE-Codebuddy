import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListTransactionsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by transactions info',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listTransactionsDtoSchema = PaginationSchema.append({
  search: Joi.string().optional(),
});
