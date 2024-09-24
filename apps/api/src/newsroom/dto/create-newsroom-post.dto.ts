import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class Author {
  @ApiProperty({
    example: 'Nick Jameson',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: '66acda8b857c576159b74da2.',
    required: true,
  })
  photo: Types.ObjectId;
}

export class CreateNewsroomPostDto {

  @ApiProperty({ required: true })
  author: Author;

  @ApiProperty({
    example: 'BBR providing open-source technology to promote fair housing in AI-powered real estate conversations',
    required: true,
    type: String,
  })
  title: string;

  @ApiProperty({ example: '66acda8b857c576159b742a2', required: true })
  featuredImage: Types.ObjectId;

  @ApiProperty({ example: '66acda8b857c576159b74ha2', required: true })
  category: Types.ObjectId;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit ...',
    required: true,
    type: String,
  })
  contents: string;
}

export const createNewsroomPostDtoSchema = Joi.object({
  author: Joi.object({
    name: Joi.string().required(),
    photo: Joi.string().custom(joiObjectIdValidator('photo')).required(),
  }).required(),
  title: Joi.string().required(),
  featuredImage: Joi.string().custom(joiObjectIdValidator('featuredImage')).required(),
  category: Joi.string().custom(joiObjectIdValidator('category')).required(),
  contents: Joi.string().required(),
});
