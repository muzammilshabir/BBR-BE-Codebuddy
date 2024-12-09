import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { CustomerSupportSource, CustomerSupportStatus, Priority } from '../enum/customer-support-enum';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';

export class ListCustomerSupportDto extends ListPropsDto {
  @ApiProperty({
    example: CustomerSupportStatus.NEW,
    enum: CustomerSupportStatus,
    description: 'The status of the customer support',
    required: false,
  })
  status?: CustomerSupportStatus;

  @ApiProperty({
    example: CustomerSupportSource.HOME,
    enum: CustomerSupportSource,
    description: 'The source of the customer support',
    required: false,
  })
  source?: CustomerSupportSource;

  @ApiProperty({
    enum: Priority,
    description: 'Priority level of the support request',
    required: false,
  })
  priority?: Priority;

  @ApiProperty({
    description: 'Search by name, email, or phone number',
    example: 'John',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by assigned user IDs',
    example: ['60d9c6a0a11c3c6c6a9a1a2b'],
    required: false,
    type: [String],
  })
  assignedTo?: string[];
}

export const listCustomerSupportSchema = PaginationSchema.append({
  status: Joi.string()
    .valid(...Object.values(CustomerSupportStatus))
    .optional(),
  source: Joi.string()
    .valid(...Object.values(CustomerSupportSource))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  assignedTo: Joi.array().items(
    Joi.string().custom(joiObjectIdValidator('assignedTo'))
  ).optional(),
  search: Joi.string().optional(),
});
