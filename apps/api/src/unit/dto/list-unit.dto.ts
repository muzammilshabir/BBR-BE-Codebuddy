import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { ResidenceStatus } from '../../residences/enum/residence-enum';

export class ListUnitDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by residence ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  residenceId?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: false,
  })
  status?: ResidenceStatus;

  @ApiProperty({
    description: 'Search by unit name and number',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listUnitSchema = PaginationSchema.append({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .optional(),
  search: Joi.string().optional(),
});
