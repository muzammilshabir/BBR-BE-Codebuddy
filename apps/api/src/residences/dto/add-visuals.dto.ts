import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import * as Joi from 'joi';

export class AddVisualsDto {
  @ApiProperty({
    example: ['66ab4bd5161117eabe919e57', '66ab4bd5161117eabe919e61'],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  mainGalleryPhotos: string[];

  @ApiProperty({
    example: ['66acda8b857c576159b74da4'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  secondGalleryPhotos: string[];

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoTour?: string;

  @ApiProperty({
    example: 'https://www.youtube.com/dummyLink',
    required: false,
  })
  @IsOptional()
  @IsString()
  videoTourLink?: string;
}

export const addVisualsSchema = Joi.object({
  mainGalleryPhotos: Joi.array().items(Joi.string()).required(),
  secondGalleryPhotos: Joi.array().items(Joi.string()).optional(),
  videoTour: Joi.string().optional(),
  videoTourLink: Joi.string().uri().optional(),
});
