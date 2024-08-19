import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { BulkMark } from '../enum/review-enum';

export class BulkActionReviewDto {
  @ApiProperty({
    example: ['64b1b5f4e05c12a1f5d8e8c8', '64b1b5f4e05c12a1f5d8e8c4'],
    description: 'ID of the Reviews to be marked',
    required: true,
  })
  reviewIds: string[];
  
  @ApiProperty({
    example: "remove",
    description: 'The action to perform(remove, responded)',
    required: true,
  })
  action: BulkMark;
  
}

export const bulkActionReviewSchema = Joi.object({
  reviewIds: Joi.array()
  .items(Joi.string().custom(joiObjectIdValidator('reviewIds')))
  .required(),
  action: Joi.string().required(),
});
