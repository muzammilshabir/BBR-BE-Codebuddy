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
