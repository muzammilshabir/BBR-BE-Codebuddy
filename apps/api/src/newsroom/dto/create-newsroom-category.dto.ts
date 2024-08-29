import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class CreateNewsroomCategoryDto {

  @ApiProperty({
    example: 'Technology & Innovation',
    required: true,
    type: String,
  })
  title: string;
}

export const createNewsroomCategoryDtoSchema = Joi.object({
  title: Joi.string().required(),
});
