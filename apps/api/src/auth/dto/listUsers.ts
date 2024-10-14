import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto } from '@bbr/api-core/modules/dto/listProps.dto';
import { UserStatus } from '../../users/enum/user.enum';

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
});
