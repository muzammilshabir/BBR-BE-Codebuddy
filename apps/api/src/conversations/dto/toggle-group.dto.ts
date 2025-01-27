import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class ToggleGroupDto {
  @ApiProperty({
    description: 'The GUID of the group',
    required: true,
    type: String,
  })
  guid: string;

  @ApiProperty({
    description: 'The ID of the user on behalf of whom the action is performed',
    required: true,
    type: String,
  })
  onBehalfOfUserId: string;
}

export const toggleGroupDtoSchema = Joi.object({
  guid: Joi.string().required(),
  onBehalfOfUserId: Joi.string().required(),
});
