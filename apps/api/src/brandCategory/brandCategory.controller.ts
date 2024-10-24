import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandCategoryService } from './brandCategory.service';
import { ListBrandDto, listBrandSchema } from '../brand/dto/listBrand.dto';

@ApiTags('BrandCategory')
@Controller('brand-category')
export class BrandController {
  constructor(private readonly brandCategoryService: BrandCategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'List all BrandCategory',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listBrandSchema, 'query'))
  async list(@Query() listBrandDto: ListBrandDto) {
    const data = await this.brandCategoryService.findAll(listBrandDto);
    return ResponseService.buildResponse(data);
  }
}
