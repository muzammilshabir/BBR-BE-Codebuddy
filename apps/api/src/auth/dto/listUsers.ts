import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto } from '@bbr/api-core/modules/dto/listProps.dto';
import { UserStatus } from '../../users/enum/user.enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListUserDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by User name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'The status of the user',
    required: false,
  })
  status?: UserStatus;
}

export const listUserSchema = Joi.object({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .optional(),
});

export class ListAdminsDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by role ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  roleId?: string;

  @ApiProperty({
    description: 'Search by User name',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    enum: UserStatus,
    description: 'The status of the user',
    required: false,
  })
  status?: UserStatus;
}

export const listAdminsSchema = Joi.object({
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .optional(),
  roleId: Joi.string().custom(joiObjectIdValidator('roleId')).optional(),
});
