import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandDraftService } from './brandDraft.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetBrandDraftByIdDto, getBrandDraftByIdSchema } from './dto/getBrandDraft.dto';
import { ListBrandDto, listBrandSchema } from '../brand/dto/listBrand.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Public } from '../auth/decorators/public.decorator';

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

  @Get()
  @ApiOperation({
    summary: 'List all brand draft with residence count',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listBrandSchema, 'query'))
  async list(@Query() listBrandDto: ListBrandDto) {
    const data = await this.brandDraftService.getLatestBrandDraftsWithResidenceCount(listBrandDto);
    return ResponseService.buildResponse(data);
  }
}
