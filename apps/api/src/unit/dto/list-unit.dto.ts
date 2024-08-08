import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListUnitDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by residence ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  residenceId?: string;
}

export const listUnitSchema = PaginationSchema.append({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
});
