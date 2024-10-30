import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { InvoiceStatus } from '../enum/invoice-status.enum';

export class ListInvoicesDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by invoice status',
    example: InvoiceStatus.PENDING,
    enum: InvoiceStatus,
    type: String,
  })
  status?: string;

  @ApiProperty({
    description: 'Search by invoice info name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listInvoicesSchema = PaginationSchema.append({
  status: Joi.string()
    .valid(...Object.values(InvoiceStatus))
    .optional(),
  search: Joi.string().optional(),
});
