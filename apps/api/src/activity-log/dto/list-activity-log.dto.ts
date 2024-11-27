import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListActivityLogDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by name or activity keyword',
    example: 'Jenny Wilson',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Start date for filtering activities',
    example: new Date(),
    required: false,
    type: Date,
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Lead ID for filtering activities',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  leadId?: string;

  @ApiProperty({
    description: 'End date for filtering activities',
    example: new Date(),
    required: false,
    type: Date,
  })
  endDate?: Date;
}

export const listActivityLogSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  leadId: Joi.string().custom(joiObjectIdValidator('leadId')).optional(),
  endDate: Joi.date()
    .iso()
    .optional()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref('startDate')).messages({
        'date.min': 'End date must be greater than start date',
      }),
    }),
});
