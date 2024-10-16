import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PermissionLevel } from '../../modulePolicy/enum/permission-enum';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'Manager',
    description: 'Updated name of the role (optional)',
    required: false,
  })
  roleName?: string;

  @ApiProperty({
    example: 'admin',
    description: 'Updated type of user associated with the role (optional)',
    required: false,
  })
  userType?: string;

  @ApiProperty({
    example: [
      { moduleId: '66ab4bd5161117eabe919e57', permissions: ['read', 'edit'] },
      { moduleId: '66ab4bd5161117eabe919e58', permissions: ['read'] },
    ],
    description: 'Updated array of modules and their associated permissions (optional)',
    required: false,
  })
  modulePermissions?: Array<{
    moduleId: Types.ObjectId;
    permissions: PermissionLevel[];
  }>;
}

export const updateRoleSchema = Joi.object({
  roleName: Joi.string().optional(),

  userType: Joi.string().valid('admin', 'seller', 'buyer').optional(),

  modulePermissions: Joi.array()
    .items(
      Joi.object({
        moduleId: Joi.string().custom(joiObjectIdValidator('moduleId')).required(),
        permissions: Joi.array()
          .items(Joi.string().valid(...Object.values(PermissionLevel)))
          .required(),
      })
    )
    .optional(),
});
