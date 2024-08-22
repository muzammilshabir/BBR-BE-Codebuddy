import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class RespondToReviewDto {
  @ApiProperty({ example: 'Thank you for your feedback.', required: true, type: String })
  response: string;
}

export const respondToReviewDtoSchema = Joi.object({
  response: Joi.string().required(),
});
