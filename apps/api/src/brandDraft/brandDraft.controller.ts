import { Controller, Get, Param, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandDraftService } from './brandDraft.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetBrandDraftByIdDto, getBrandDraftByIdSchema } from './dto/getBrandDraft.dto';

@ApiTags('BrandDraft')
@Controller('brand-draft')
export class BrandDraftController {
  constructor(private readonly brandDraftService: BrandDraftService) {}

  @Get(':brandDraftId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a Brand Draft by ID' })
  @UsePipes(new JoiValidationPipe(getBrandDraftByIdSchema, 'param'))
  async getBrandDraftById(@Param() params: GetBrandDraftByIdDto) {
    const brandDraft = await this.brandDraftService.getBrandDraftById(params.brandDraftId);
    return {
      message: 'Brand draft retrieved successfully',
      data: brandDraft,
    };
  }
}
