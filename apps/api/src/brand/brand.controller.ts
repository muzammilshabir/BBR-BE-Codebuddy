import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { ListBrandDto, listBrandSchema } from './dto/listBrand.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateBrandDto, updateBrandSchema } from './dto/updateBrand.dto';
import {
  CreateBrandApplyDto,
  createBrandApplySchema,
  CreateBrandDraftDto,
  createBrandDraftSchema,
} from './dto/createBrandDraft.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { GetBrandByIdDto, getBrandByIdSchema } from './dto/getBrand.dto';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({
    summary: 'List all residenceType',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listBrandSchema, 'query'))
  async list(@Query() listBrandDto: ListBrandDto) {
    const data = await this.brandService.findAll(listBrandDto);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an Brand by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateBrandSchema, 'body'))
  async update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    const updatedBrand = await this.brandService.update(id, updateBrandDto);
    return ResponseService.buildResponse(updatedBrand);
  }

  @Post('save-as-draft')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('brands', PermissionLevel.EDIT)
  @ApiOperation({ summary: 'Save Brand as draft' })
  @UsePipes(new JoiValidationPipe(createBrandDraftSchema, 'body'))
  async saveAsDraft(@Body() createBrandDraftDto: CreateBrandDraftDto) {
    const brandDraft = await this.brandService.saveAsDraft(createBrandDraftDto);
    return {
      message: 'Brand draft saved successfully',
      data: brandDraft,
    };
  }

  @Post('save-and-apply')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Permissions('brands', PermissionLevel.EDIT)
  @ApiOperation({ summary: 'Save and Apply a new brand' })
  @UsePipes(new JoiValidationPipe(createBrandApplySchema, 'body'))
  async saveAndApplyBrand(@Body() createBrandApplyDto: CreateBrandApplyDto) {
    const result = await this.brandService.saveAndApplyBrand(createBrandApplyDto);
    return {
      message: 'Brand saved and applied successfully',
      data: result,
    };
  }

  @Get(':brandId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a Brand by ID' })
  @UsePipes(new JoiValidationPipe(getBrandByIdSchema, 'param'))
  async getBrandDraftById(@Param() params: GetBrandByIdDto) {
    const brandDraft = await this.brandService.getBrandById(params.brandId);
    return {
      message: 'Brand draft retrieved successfully',
      data: brandDraft,
    };
  }
}
