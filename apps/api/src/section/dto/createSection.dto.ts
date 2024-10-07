import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { PermissionLevel } from '../enum/permission-enum';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { Types } from 'mongoose';

export class CreateSectionDto {
  @ApiProperty({ example: 'Customer Support', required: true })
  @IsString()
  name: string;

  @ApiProperty({
    example: [PermissionLevel.READ, PermissionLevel.EDIT, PermissionLevel.DELETE],
    required: true,
    enum: PermissionLevel,
    type: [String],
  })
  @IsArray()
  permissions: PermissionLevel[];

  @ApiProperty({
    example: [
      {
        ImageId: '66ab4bd5161117eabe919e57',
        type: 'logo',
      },
    ],
    required: true,
  })
  upload?: {
    ImageId: Types.ObjectId;
    type: string;
  }[];
}

export const createSectionSchema = Joi.object({
  name: Joi.string().trim().required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(PermissionLevel)))
    .required(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
