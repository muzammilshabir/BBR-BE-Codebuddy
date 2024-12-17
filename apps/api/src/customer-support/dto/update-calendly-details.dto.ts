import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { LocationDetails } from '../type/customer-support.type';
import { locationDetailsSchema } from './create-customer-support.dto';

export class UpdateCalendlyDetailsDto {
  @ApiProperty({ 
    description: 'Creation date and time of the Calendly event',
    type: Date,
    required: true 
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Start date and time of the meeting',
    type: Date,
    required: true 
  })
  meetingStart: Date;

  @ApiProperty({ 
    description: 'Name of the meeting',
    example: '30 Minute Meeting',
    required: false 
  })
  meetingName?: string;

  @ApiProperty({ 
    description: 'Location details of the meeting',
    type: LocationDetails,
    required: false 
  })
  location?: LocationDetails;

  @ApiProperty({ 
    description: 'URL to cancel the meeting',
    example: 'https://calendly.com/cancellations/...',
    required: false 
  })
  cancelUrl?: string;

  @ApiProperty({ 
    description: 'URL to reschedule the meeting',
    example: 'https://calendly.com/reschedulings/...',
    required: false 
  })
  rescheduleUrl?: string;
}

export const updateCalendlyDetailsSchema = Joi.object({
  createdAt: Joi.date().iso().required(),
  meetingStart: Joi.date().iso().required(),
  meetingName: Joi.string().optional(),
  location: locationDetailsSchema.optional(),
  cancelUrl: Joi.string().uri().optional(),
  rescheduleUrl: Joi.string().uri().optional(),
}); 