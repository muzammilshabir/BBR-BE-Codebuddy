import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ResidenceStatus } from '../enum/residence-enum';

export class ListResidenceDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by Location ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  locationId?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: false,
  })
  status: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by seller ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  sellerId?: string;
}

export const listResidenceSchema = PaginationSchema.append({
  locationId: Joi.string().custom(joiObjectIdValidator('locationId')).optional(),
  sellerId: Joi.string().custom(joiObjectIdValidator('sellerId')).optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .required(),
});
