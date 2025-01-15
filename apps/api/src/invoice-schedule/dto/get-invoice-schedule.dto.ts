import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';

export const getInvoiceScheduleSchema = joi.object({
  developerId: joi.string().required(),
  residenceId: joi.string().required(),
});

export class GetInvoiceScheduleDto {
  @ApiProperty({
    example: 'dev_123',
    description: 'Developer ID to fetch the invoice schedule for',
  })
  developerId: string;

  @ApiProperty({
    example: 'res_123',
    description: 'Residence ID to fetch the invoice schedule for',
  })
  residenceId: string;
}
