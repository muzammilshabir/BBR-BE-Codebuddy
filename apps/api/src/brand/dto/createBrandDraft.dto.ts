import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export const createBrandDraftSchema = Joi.object({
  brandId: Joi.string().custom(joiObjectIdValidator('brandId')).optional(),
  name: Joi.string().required().max(100), // Brand name is required
  description: Joi.string().optional().allow(null),
  brandCategoryId: Joi.string().custom(joiObjectIdValidator('brandCategoryId')).required(), // Required objectId reference to BrandCategory
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().required(), // Each upload must have an ImageId
        type: Joi.string().required(), // Type of upload (image, etc.)
      })
    )
    .optional(),
  registeredDate: Joi.date().optional(),
});

export class UploadDto {
  @ApiProperty({
    description: 'ID of the uploaded image',
    example: '64b9b23e47a010ab41b58913',
  })
  ImageId: string;

  @ApiProperty({
    description: 'Type of the upload (image, etc.)',
    example: 'image',
  })
  type: string;
}

export class CreateBrandDraftDto {
  @ApiProperty({
    description: 'Optional ID of an existing brand. If not provided, a new brand will be created.',
    example: '64b9b23e47a010ab41b58913',
    required: false,
    type: String,
  })
  brandId?: string;

  @ApiProperty({
    description: 'Name of the brand',
    required: true,
    type: String,
    example: 'My Brand',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the brand',
    required: false,
    type: String,
    example: 'This is a great brand',
  })
  description?: string;

  @ApiProperty({
    description: 'ID of the brand category',
    required: true,
    type: String,
    example: '64b9b23e47a010ab41b58913',
  })
  brandCategoryId: string;

  @ApiProperty({
    description: 'Array of upload information (ImageId and type)',
    required: false,
    type: [UploadDto], // This should be an array of objects
  })
  upload?: UploadDto[];

  @ApiProperty({
    description: 'Date the brand was registered',
    required: false,
    type: String,
    example: '2024-10-24',
  })
  registeredDate?: Date;
}

export const createBrandApplySchema = Joi.object({
  brandId: Joi.string().custom(joiObjectIdValidator('brandId')).optional(),
  name: Joi.string().required().max(100), // Brand name is required
  description: Joi.string().optional().allow(null),
  brandCategoryId: Joi.string().custom(joiObjectIdValidator('brandCategoryId')).required(), // Required objectId reference to BrandCategory
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().required(), // Each upload must have an ImageId
        type: Joi.string().required(), // Type of upload (image, etc.)
      })
    )
    .optional(),
  registeredDate: Joi.date().optional(),
});

export class CreateBrandApplyDto {
  @ApiProperty({
    description: 'Optional ID of an existing brand. If not provided, a new brand will be created.',
    example: '64b9b23e47a010ab41b58913',
    required: false,
    type: String,
  })
  brandId?: string;

  @ApiProperty({
    description: 'Name of the brand',
    required: true,
    type: String,
    example: 'My Brand',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the brand',
    required: false,
    type: String,
    example: 'This is a great brand',
  })
  description?: string;

  @ApiProperty({
    description: 'ID of the brand category',
    required: true,
    type: String,
    example: '64b9b23e47a010ab41b58913',
  })
  brandCategoryId: string;

  @ApiProperty({
    description: 'Array of upload information (ImageId and type)',
    required: false,
    type: [UploadDto], // This should be an array of objects
  })
  upload?: UploadDto[];

  @ApiProperty({
    description: 'Date the brand was registered',
    required: false,
    type: String,
    example: '2024-10-24',
  })
  registeredDate?: Date;
}
