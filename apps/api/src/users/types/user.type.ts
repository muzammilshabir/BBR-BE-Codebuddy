import { ApiProperty } from '@nestjs/swagger';
import { UserContactMethod } from '../enum/user.enum';
import { Types } from 'mongoose';

export class UserPhone {
  @ApiProperty({ description: 'Country code of the phone number', example: '+1' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number', example: '1234567890' })
  number: string;
}

export class UserCompanyInfo {
  @ApiProperty({ description: 'Company address', example: '123 Main St, Cityville' })
  address: string;

  @ApiProperty({ description: 'Corporate phone number', type: UserPhone })
  corporatePhone: UserPhone;

  @ApiProperty({ description: 'Company website', example: 'https://example.com' })
  website: string;
}

export class UserContactPersonInfo {
  @ApiProperty({ description: 'Full name of the contact person', example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ description: 'Job title of the contact person', example: 'Manager' })
  jobTitle: string;

  @ApiProperty({ description: 'Email of the contact person', example: 'janedoe@example.com' })
  email: string;

  @ApiProperty({ description: 'Phone of the contact person', type: UserPhone })
  phone: UserPhone;
}

export class UserContactInfo {
  @ApiProperty({
    description: 'Location ID associated with the contact',
    example: '66acda8b857c576159b74da4',
  })
  countryId: string;

  @ApiProperty({ description: 'Phone information', type: UserPhone })
  phone: UserPhone;

  @ApiProperty({ description: 'Preferred contact methods', enum: UserContactMethod, isArray: true })
  preferredContactMethods: UserContactMethod[];
}

export class UserBudget {
  @ApiProperty({ description: 'Minimum budget', example: 100000 })
  min: number;

  @ApiProperty({ description: 'Maximum budget', example: 500000 })
  max: number;
}

export class UserPreferences {
  @ApiProperty({
    description: 'IDs of preferred residence types',
    isArray: true,
    example: ['residence1', 'residence2'],
  })
  residenceTypeIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred cities',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
    required: false,
  })
  cityIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred countries',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
    required: false,
  })
  countryIds?: Types.ObjectId[];

  @ApiProperty({
    description: 'IDs of preferred lifestyle options',
    isArray: true,
    example: ['66acda8b857c576159b74da4', '66acda8b857c576159b74da4'],
  })
  lifeStyleIds?: Types.ObjectId[];

  @ApiProperty({ description: 'Budget preferences', type: UserBudget })
  budget: UserBudget;
}

export class UserNotificationPreferences {
  @ApiProperty({ description: 'Preference for receiving the latest news', example: true })
  latestNews: boolean;

  @ApiProperty({ description: 'Preference for receiving market trends', example: true })
  marketTrends: boolean;

  @ApiProperty({ description: 'Preference for receiving blogs', example: true })
  blogs: boolean;

  @ApiProperty({ description: 'Preference for receiving push notifications', example: true })
  pushNotifications: boolean;

  @ApiProperty({ description: 'Preference for receiving email notifications', example: true })
  emailNotifications: boolean;
}
