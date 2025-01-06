import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { FileType } from 'src/residences/enum/residence-enum';

export class ListRankingActivityLogDto extends ListPropsDto {
  @ApiProperty({
    description: 'Search by name or activity keyword',
    example: 'Maintenance visit',
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
    description: 'Ranking ID for filtering activities',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  rankingId?: string;

  @ApiProperty({
    description: 'Ranking Category ID for filtering activities',
    example: '666666666666666666666666',
    required: false,
    type: String,
  })
  categoryId?: string;

  @ApiProperty({
    description: 'End date for filtering activities',
    example: new Date(),
    required: false,
    type: Date,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Set to true if you want to download the data',
    example: false,
    required: false,
    default: false,
  })
  isDownload?: boolean = false;

  @ApiProperty({
    description: 'File type for download (excel or csv)',
    example: FileType.EXCEL,
    enum: FileType,
    required: false,
  })
  fileType?: FileType;
}

export const listRankingActivityLogSchema = PaginationSchema.append({
  search: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  rankingId: Joi.string().custom(joiObjectIdValidator('rankingId')).optional(),
  categoryId: Joi.string().custom(joiObjectIdValidator('categoryId')).optional(),
  endDate: Joi.date()
    .iso()
    .optional()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref('startDate')).messages({
        'date.min': 'End date must be greater than start date',
      }),
    }),
  isDownload: Joi.boolean().default(false).optional(),
  fileType: Joi.string()
    .valid(...Object.values(FileType))
    .optional(),
});
