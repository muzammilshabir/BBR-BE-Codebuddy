import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListConversationDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by lead name, country, or residence name',
    example: 'John',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'The customer support id',
    example: '666666666666666666666666',
    required: true,
    type: String,
  })
  customerSupportId: string;
}

export const listConversationSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  customerSupportId: Joi.string().custom(joiObjectIdValidator('customerSupportId')).required(),
});
