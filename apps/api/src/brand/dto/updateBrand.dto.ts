import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { Types } from 'mongoose';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { BrandStatus } from '../enum/brand-enum';

export class UpdateBrandDto {
  @ApiProperty({
    description: 'Name of the Brand',
    example: 'Alila Residences',
    required: false,
    type: String,
  })
  name?: string;

  @ApiProperty({
    example: '66acda8b857c576159b74da4',
    required: false,
  })
  brandCategoryId?: Types.ObjectId;

  @ApiProperty({
    description: 'Array of images associated with the brand',
    example: [
      {
        ImageId: '603d2f7f5d9a3c45f4f4b1e1',
        type: 'main',
      },
    ],
    required: false,
  })
  upload?: {
    ImageId?: Types.ObjectId;
    type?: string;
  }[];
}

export const updateBrandSchema = Joi.object({
  name: Joi.string().trim().optional(),
  brandCategoryId: Joi.string().optional().custom(joiObjectIdValidator('brandCategoryId')),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});

export class UpdateBrandStatusDto {
  @ApiProperty({
    description: 'New status of the brand',
    enum: BrandStatus,
    example: BrandStatus.ACTIVE,
  })
  status: BrandStatus;
}

export const updateBrandStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      BrandStatus.PENDING,
      BrandStatus.INACTIVE,
      BrandStatus.ARCHIVED,
      BrandStatus.DELETED,
      BrandStatus.ACTIVE
    )
    .required(),
});
