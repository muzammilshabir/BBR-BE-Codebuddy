import { ApiProperty } from '@nestjs/swagger';
import {
  guestApplyRankingSchema,
  ResidenceDetailsDto,
  UserDetailsDto,
} from './guast-apply-ranking.dto';

export const guestPremiumResidenceProfileSchema = guestApplyRankingSchema.fork(
  ['rankingCategoryIds'],
  (schema) => schema.forbidden()
);

export class GuestPremiumResidenceProfileDto {
  @ApiProperty({
    description: 'Residence details',
    type: ResidenceDetailsDto,
  })
  residenceDetails: ResidenceDetailsDto;

  @ApiProperty({
    description: 'User details',
    type: UserDetailsDto,
  })
  userDetails: UserDetailsDto;

  @ApiProperty({
    description: 'Stripe payment method token ID',
    type: String,
  })
  stripePmTokenId: string;
}
