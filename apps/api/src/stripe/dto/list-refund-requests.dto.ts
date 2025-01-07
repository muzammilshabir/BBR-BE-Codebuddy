import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { RefundRequestStatus } from '../enum/refund-status.enum';

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
    example: RefundRequestStatus.REQUESTED,
    enum: RefundRequestStatus,
    required: false,
    type: String,
  })
  status?: RefundRequestStatus;

  @ApiProperty({
    description: 'Search by residence name',
    example: 'Sunset Apartments',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by reason type ID',
    example: '677b6c166da7f3e2d3b2f80b',
    required: false,
    type: String,
  })
  reasonTypeId?: string;
}

export const listRefundRequestsSchema = PaginationSchema.append({
  residenceId: Joi.string().optional(),
  developerId: Joi.string().optional(),
  reasonTypeId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(RefundRequestStatus))
    .optional(),
  search: Joi.string().optional(),
});
