import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetSimilarResidenceDto extends ListPropsDto {
  @ApiProperty({
    description: 'Residence id',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: true,
    type: String,
  })
  residenceId: string;

  @ApiProperty({
    description: 'Ranking category id',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  rankingCategoryId?: string;
}

export const getSimilarResidenceSchema = PaginationSchema.append({
  residenceId: Joi.string().required(),
  rankingCategoryId: Joi.string().custom(joiObjectIdValidator('rankingCategoryId')).optional(),
});
