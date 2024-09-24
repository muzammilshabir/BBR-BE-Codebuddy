import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class CreateBlogCategoryDto {

  @ApiProperty({
    example: 'Market Trends',
    required: true,
    type: String,
  })
  title: string;
}

export const createBlogCategoryDtoSchema = Joi.object({
  title: Joi.string().required(),
});
