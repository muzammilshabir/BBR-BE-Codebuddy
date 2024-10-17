import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class GetRoleByIdDto {
  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the Role',
    required: true,
  })
  roleId: string;
}

export const getRoleByIdSchema = Joi.object({
  roleId: Joi.string().custom(joiObjectIdValidator('roleId')).required(),
});
