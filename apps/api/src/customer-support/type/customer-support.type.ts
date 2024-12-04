import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum/customer-support-enum';
import { Types } from 'mongoose';

export class CustomerSupportFeatureRequest {
  @ApiProperty({
    description: 'Role of the contact',
    example: Role.SELLER,
    enum: Role,
  })
  role: Role;

  @ApiProperty({ description: 'Feature page link',example: 'https://www.google.com' })
  featurePageLink: string;

  @ApiProperty({ description: 'Feature description',example: 'I want to add a new feature to the website' })
  featureDescription: string;

  @ApiProperty({ 
    description: 'Supporting documents',
    type: [Types.ObjectId],
    example: ['60d9c6a0a11c3c6c6a9a1a2b'],
    required: false,
  })
  documents?: Types.ObjectId[]; 
}

export class CustomerSupportErrorReport {
  @ApiProperty({ description: 'Role of the contact',example: Role.SELLER })
  role: Role;

  @ApiProperty({ description: 'Error page link',example: 'https://www.google.com' })
  errorPageLink: string;

  @ApiProperty({ description: 'Error description',example: 'I want to add a new feature to the website' })
  errorDescription: string;

  @ApiProperty({
    description: 'Supporting documents',
    type: [Types.ObjectId],
    required: false,
    example: ['60d9c6a0a11c3c6c6a9a1a2b'],
  })
  documents?: Types.ObjectId[]; 
}

export class LocationDetails {
  @ApiProperty({
    description: 'URL of the meeting location',
    example: 'https://meet.google.com/kvu-jedv-kvj',
    required: true
  })
  location: string;

  @ApiProperty({
    description: 'Type of the meeting location',
    example: 'custom',
    required: true
  })
  type: string;
}

export class CalendlyDetails {
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
