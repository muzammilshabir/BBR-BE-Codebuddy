import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListInvoicesDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by invoice info name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listInvoicesSchema = PaginationSchema.append({
  search: Joi.string().optional(),
});
