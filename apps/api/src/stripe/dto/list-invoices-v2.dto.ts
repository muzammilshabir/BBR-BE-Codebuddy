import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { InvoiceStatus } from '../enum/invoice-status.enum';

export class ListInvoicesV2Dto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by residence ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
    type: String,
  })
  residenceId?: string;

  @ApiProperty({
    description: 'Filter by developer ID',
    example: '507f1f77bcf86cd799439011',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    description: 'Filter by invoice status',
    example: InvoiceStatus.PENDING,
    enum: InvoiceStatus,
    required: false,
    type: String,
  })
  status?: InvoiceStatus;

  @ApiProperty({
    description: 'Search by invoice info',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listInvoicesV2Schema = PaginationSchema.append({
  residenceId: Joi.string().optional(),
  developerId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(InvoiceStatus))
    .optional(),
  search: Joi.string().optional(),
});
