import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListAdminNoteDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by title or description',
    example: 'Customer Interaction',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Customer Support ID for filtering',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  customerSupportId?: string;

}

export const listAdminNoteSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  customerSupportId: Joi.string().custom(joiObjectIdValidator('customerSupportId')).optional(),
});
