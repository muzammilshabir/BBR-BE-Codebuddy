import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { PermissionLevel } from '../../modulePolicy/enum/permission-enum';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Manager',
    description: 'The name of the role',
    required: true,
  })
  roleName: string;

  @ApiProperty({
    example: 'admin',
    description: 'The type of user associated with the role (admin, seller, buyer)',
    required: true,
  })
  userType: string;

  @ApiProperty({
    example: [
      { moduleId: '66ab4bd5161117eabe919e57', permissions: ['read', 'edit'] },
      { moduleId: '66ab4bd5161117eabe919e58', permissions: ['read'] },
    ],
    description: 'Array of modules and their associated permissions',
    required: true,
  })
  modulePermissions: Array<{
    moduleId: Types.ObjectId;
    permissions: PermissionLevel[];
  }>;
}

export const createRoleSchema = Joi.object({
  roleName: Joi.string().required().messages({
    'string.empty': 'Role name is required',
  }),

  userType: Joi.string().valid('admin', 'seller', 'buyer').required().messages({
    'string.empty': 'User type is required',
    'any.only': 'User type must be one of [admin, seller, buyer]',
  }),

  modulePermissions: Joi.array()
    .items(
      Joi.object({
        moduleId: Joi.string().custom(joiObjectIdValidator('moduleId')).required(),
        permissions: Joi.array()
          .items(Joi.string().valid(...Object.values(PermissionLevel)))
          .required(),
      })
    )
    .required()
    .messages({
      'array.base': 'Module permissions must be an array',
      'array.includesRequiredUnknowns': 'Module permissions are required',
    }),
});
