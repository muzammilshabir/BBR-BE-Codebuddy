import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { CustomerSupportSource, CustomerSupportStatus, Priority } from '../enum/customer-support-enum';

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
  search: Joi.string().optional(),
});
