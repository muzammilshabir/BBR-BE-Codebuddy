import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListEditorEditorDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by title or description',
    example: 'Customer Interaction',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Residence Id for filtering',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  residenceId?: string;
}

export const listEditorNoteSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
});
