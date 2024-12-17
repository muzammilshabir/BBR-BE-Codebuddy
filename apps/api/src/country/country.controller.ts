import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryService } from './country.service';
import { Public } from '../auth/decorators/public.decorator';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListCountryDto, listCountrySchema } from './dto/listCountry.dto';
import { UserRole } from '../users/enum/user.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateCountryDto, updateCountrySchema } from './dto/updateCountry.dto';
import { GetByIdDto, getIdSchema } from '../city/dto/getById.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  @ApiOperation({
    summary: 'List all country',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listCountrySchema, 'query'))
  async list(@Query() listCountryDto: ListCountryDto) {
    const data = await this.countryService.findAll(listCountryDto);
    return ResponseService.buildResponse(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an Country by ID',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateCountrySchema, 'body'))
  async update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    const updatedCountry = await this.countryService.update(id, updateCountryDto);
    return ResponseService.buildResponse(updatedCountry);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Country by ID',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(getIdSchema, 'param'))
  async getResidenceById(@Param() params: GetByIdDto) {
    const country = await this.countryService.getCountryById(params.id);
    return ResponseService.buildResponse({ country }, 'country retrieved successfully');
  }

  @Public()
  @ApiOperation({
    summary: 'Upload Country Seeder',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload-country-seeder')
  @UseInterceptors(FileInterceptor('file'))
  async processCountrySeeder(
    @UploadedFile() file: Express.Multer.File,
  ) {
  
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.countryService.processCountrySeeder(file);
    return ResponseService.buildResponse(result);
  }

}
