import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import JoiDate from '@joi/date';
import { RenewalFrequency } from '../invoiceSchedule.enum';

const Joi = joi.extend(JoiDate);

export const featureSchema = Joi.object({
  featureId: Joi.string(),
  featureName: Joi.string(),
  unitAmount: Joi.number().required(),
  quantity: Joi.number().required(),
}).xor('featureId', 'featureName');

export class Feature {
  @ApiProperty({ example: 'feat_123', description: 'Feature ID' })
  featureId: string;

  @ApiProperty({ example: 'Feature Name', description: 'Feature Name' })
  featureName: string;

  @ApiProperty({ example: 100, description: 'Unit amount for the feature' })
  unitAmount: number;

  @ApiProperty({ example: 2, description: 'Quantity of the feature' })
  quantity: number;
}

export const createInvoiceScheduleSchema = Joi.object({
  buyerId: Joi.string().required(),
  buyerEmail: Joi.string().email().required(),
  companyName: Joi.string().required(),
  residenceId: Joi.string().required(),
  planId: Joi.string().required(),
  issueDate: Joi.date().format('YYYY-MM-DD').raw().required(),
  dueDate: Joi.date().format('YYYY-MM-DD').greater(Joi.ref('issueDate')).raw().required(),
  currentPaymentMethodId: Joi.string().required(),
  features: Joi.array().items(featureSchema).required(),
  discountAmount: Joi.number().min(0).required(),
  taxPercentage: Joi.number().min(0).max(100).required(),
  notes: Joi.string().optional(),
  renewalFrequency: Joi.string()
    .valid(...Object.values(RenewalFrequency))
    .required(),
  paymentMethodId: Joi.string().required(),
  reminderDays: Joi.number().min(0).required(),
  maxRenewalAttemptsCount: Joi.number().min(1).required(),
  attemptsFrequency: Joi.number().min(1).required(),
  gracePeriodDays: Joi.number().min(0).required(),
  publish: Joi.boolean().required(),
});

export class CreateInvoiceScheduleDto {
  @ApiProperty({ example: 'buyer_123', description: 'Buyer ID' })
  buyerId: string;

  @ApiProperty({ example: 'buyer@example.com', description: 'Buyer email address' })
  buyerEmail: string;

  @ApiProperty({ example: 'Acme Corp', description: 'Company name' })
  companyName: string;

  @ApiProperty({ example: 'res_123', description: 'Residence ID' })
  residenceId: string;

  @ApiProperty({ example: 'plan_123', description: 'Plan ID' })
  planId: string;

  @ApiProperty({ example: '2024-12-31', description: 'Issue date (YYYY-MM-DD)' })
  issueDate: Date;

  @ApiProperty({ example: '2025-01-31', description: 'Due date (YYYY-MM-DD)' })
  dueDate: Date;

  @ApiProperty({ example: 'pm_123', description: 'Current payment method ID' })
  currentPaymentMethodId: string;

  @ApiProperty({ type: [Feature], description: 'Array of features' })
  features: Feature[];

  @ApiProperty({ example: 100, description: 'Discount amount' })
  discountAmount: number;

  @ApiProperty({ example: 18, description: 'Tax percentage' })
  taxPercentage: number;

  @ApiProperty({ example: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ enum: RenewalFrequency, example: RenewalFrequency.MONTHLY })
  renewalFrequency: RenewalFrequency;

  @ApiProperty({ example: 'pm_123', description: 'Payment method ID' })
  paymentMethodId: string;

  @ApiProperty({ example: 7, description: 'Days before due date to send reminder' })
  reminderDays: number;

  @ApiProperty({ example: 3, description: 'Maximum number of renewal attempts' })
  maxRenewalAttemptsCount: number;

  @ApiProperty({ example: 24, description: 'Frequency of renewal attempts in hours' })
  attemptsFrequency: number;

  @ApiProperty({ example: 5, description: 'Grace period in days' })
  gracePeriodDays: number;

  @ApiProperty({ example: true, description: 'Whether to publish the schedule' })
  publish: boolean;
}
