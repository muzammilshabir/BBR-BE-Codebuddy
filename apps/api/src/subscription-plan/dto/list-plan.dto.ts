import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export enum PlanForPage {
  GUEST_UPLOAD_INVENTORY = 'guest-upload-inventory',
  REQUEST_PREMIUM_RESIDENCE_PROFILE = 'request-premium-residence-profile',
}

export class ListPlansDto {
  @ApiProperty({
    description: 'For page',
    example: PlanForPage.GUEST_UPLOAD_INVENTORY,
    required: false,
    enum: PlanForPage,
  })
  forPage?: PlanForPage;
}

export const listPlanSchema = Joi.object({
  forPage: Joi.string().optional(),
});
