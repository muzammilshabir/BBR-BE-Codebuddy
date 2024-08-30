import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class AddResidenceEnquiryDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the person making the enquiry',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the person making the enquiry',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the person making the enquiry',
    required: true,
  })
  phoneNumber: string;

  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the user associated with the enquiry (if any)',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c2',
    description: 'ID of the residence being enquired about',
    required: false,
  })
  residenceId?: string;

  @ApiProperty({
    example: '64b1b5f4e05c12a1f5d8e7c3',
    description: 'ID of the unit being enquired about',
    required: false,
  })
  unitId?: string;
}

export const addResidenceEnquirySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  userId: Joi.string().custom(joiObjectIdValidator('userId')).optional(),
  residenceId: Joi.string().custom(joiObjectIdValidator('residenceId')).optional(),
  unitId: Joi.string().custom(joiObjectIdValidator('unitId')).optional(),
});
