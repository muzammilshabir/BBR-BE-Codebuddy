import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RefundStatus } from '../enum/refund-status.enum';

export class ListRefundRequestsDto extends ListPropsDto {
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
    description: 'Filter by refund status',
    example: RefundStatus.REQUESTED,
    enum: RefundStatus,
    required: false,
    type: String,
  })
  status?: RefundStatus;

  @ApiProperty({
    description: 'Search by residence name',
    example: 'Sunset Apartments',
    required: false,
    type: String,
  })
  search?: string;
}

export const listRefundRequestsSchema = PaginationSchema.append({
  residenceId: Joi.string().optional(),
  developerId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(RefundStatus))
    .optional(),
  search: Joi.string().optional(),
});
