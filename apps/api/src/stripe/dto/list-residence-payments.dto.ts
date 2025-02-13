import { OmitType } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';

export class ListResidencePaymentsDto extends OmitType(ListPropsDto, ['limit', 'page']) {}

export const listResidencePaymentsSchema = PaginationSchema.fork(['limit', 'page'], (schema) =>
  schema.forbidden()
);
