import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { ResidenceStatus } from 'src/residences/enum/residence-enum';

export class ListPlanResidencesDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by plan info',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Residence Status',
    example: ResidenceStatus.ACTIVE,
    required: false,
    enum: ResidenceStatus,
    type: String,
  })
  status?: ResidenceStatus;
}

export const listPlanResidencesDtoSchema = PaginationSchema.append({
  search: Joi.string().optional(),
});
