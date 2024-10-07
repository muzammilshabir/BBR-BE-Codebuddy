import { ApiProperty } from '@nestjs/swagger';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import * as Joi from 'joi';
import { RankingCategoryStatus } from '../enum/rankingCategory-status.enum';

export const rankingCategorySchema = PaginationSchema.append({
  search: Joi.string().trim().max(100),
  status: Joi.string()
    .valid(...Object.values(RankingCategoryStatus))
    .optional(),
});

export class RankingCategoryListDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search ranking category',
    example: 'test',
    required: false,
    type: String,
  })
  search?: string;

  @ApiProperty({
    description: 'Ranking category status',
    example: RankingCategoryStatus.APPROVED,
    required: false,
    enum: RankingCategoryStatus,
  })
  status?: RankingCategoryStatus;
}
