import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListReviewsDto extends ListPropsDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e8c2',
    description: 'ID of the Residence for Reviews',
    required: true,
    type: String,
  })
  residenceId: string;
  
  @ApiProperty({
    example: false,
    description: 'Is the Review flagged as invalid',
    required: false,
    type: Boolean,
  })
  isFlagged?: boolean;

  @ApiProperty({
    description: 'Search by Review name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;
}

export const listReviewsSchema = PaginationSchema.append({
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
  isFlagged: Joi.boolean().optional(),
  search: Joi.string().optional(),
});
