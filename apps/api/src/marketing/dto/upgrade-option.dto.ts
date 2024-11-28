import { joiObjectIdValidator } from "@bbr/api-core/modules/custome-validations/custome-validations";
import { ApiProperty } from "@nestjs/swagger";
import * as Joi from 'joi';


export const residenceIdSchema = Joi.object({
    residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).required(),
});

export class ResidenceIdDto {
    @ApiProperty({
      description: 'Residence ID',
      example: '66acda8b857c576159b74da2',
      required: true,
    })
    residenceId: string;
  }