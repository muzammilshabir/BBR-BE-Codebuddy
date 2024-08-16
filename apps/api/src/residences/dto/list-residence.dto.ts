import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { ListPropsDto, PaginationSchema } from '@bbr/api-core/modules/dto/listProps.dto';
import { joiObjectIdValidator } from '@bbr/api-core/modules/custome-validations/custome-validations';
import { FileType, ResidenceStatus } from '../enum/residence-enum';

export class ListResidenceDto extends ListPropsDto {
  @ApiProperty({
    description: 'Filter by Location ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  locationId?: string;

  @ApiProperty({
    example: ResidenceStatus.ACTIVE,
    enum: ResidenceStatus,
    description: 'The status of the residence',
    required: true,
  })
  status: ResidenceStatus;

  @ApiProperty({
    description: 'Filter by Developer ID',
    example: '60b6c0f53b5a5c1f88d25a1b',
    required: false,
    type: String,
  })
  developerId?: string;

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

export const listResidenceSchema = PaginationSchema.append({
  locationId: Joi.string().custom(joiObjectIdValidator('locationId')).optional(),
  developerId: Joi.string().custom(joiObjectIdValidator('developerId')).optional(),
  status: Joi.string()
    .valid(...Object.values(ResidenceStatus))
    .required(),
  isDownload: Joi.boolean().default(false).optional(),
  fileType: Joi.string()
    .valid(...Object.values(FileType))
    .optional(),
});
