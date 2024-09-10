import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ResidenceStatus } from '../../residences/enum/residence-enum';

export class ListResidenceDraftDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by residence name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by ciyt ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  cityId?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: false,
  })
  status?: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;
}

export const listResidenceDraftSchema = PaginationSchema.append({
  cityId: Joi.string().custom(joiObjectIdValidator('cityId')).optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .optional(),
});
