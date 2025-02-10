import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { ClaimRequestStatus } from '../enum/claimReques-enum';

export class GetClaimRequestByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the ClaimRequest',
    required: true,
  })
  id: string;
}

export const getClaimRequestIdSchema = Joi.object({
  id: Joi.string().custom(joiObjectIdValidator('id')).required(),
});

export class ListClaimRequestDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by fullName',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: ClaimRequestStatus.Pending,
    enum: ClaimRequestStatus,
    description: 'The status of the claim request',
    required: false,
  })
  status?: ClaimRequestStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

  @ApiProperty({
    description: 'Filter by Residence ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  residenceId?: string;
}

export const listClaimRequestSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  status: Joi.string()
    .valid(...Object.values(ClaimRequestStatus))
    .optional(),
});

export class GetOpenRequestsDto {
  @ApiProperty({ example: '60d9c6a0a11c3c6c6a9a1a2a', required: true })
  residenceId: string;
}

export const getOpenRequestsSchema = Joi.object({
  residenceId: Joi.string().required(),
});
