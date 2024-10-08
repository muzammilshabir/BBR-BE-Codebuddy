import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateModulePolicyDto } from './createModulePolicy.dto';
import { PermissionLevel } from '../enum/permission-enum';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateSectionDto extends PartialType(CreateModulePolicyDto) {
  @ApiProperty({ example: 'Customer Support', required: false })
  name?: string;

  @ApiProperty({
    example: [PermissionLevel.READ, PermissionLevel.EDIT],
    required: false,
    enum: PermissionLevel,
    type: [String],
  })
  permissions?: PermissionLevel[];

  @ApiProperty({
    example: [
      {
        ImageId: '66ab4bd5161117eabe919e57',
        type: 'logo',
      },
    ],
    required: false,
  })
  upload?: {
    ImageId: Types.ObjectId;
    type: string;
  }[];
}

export const updateSectionSchema = Joi.object({
  name: Joi.string().trim().optional(),
  permissions: Joi.array()
    .items(Joi.string().valid(...Object.values(PermissionLevel)))
    .optional(),
  upload: Joi.array()
    .items(
      Joi.object({
        ImageId: Joi.string().optional().custom(joiObjectIdValidator('ImageId')),
        type: Joi.string().trim().optional(),
      })
    )
    .optional(),
});
