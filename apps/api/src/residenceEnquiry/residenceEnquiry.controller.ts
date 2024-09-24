import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResidenceEnquiryService } from './residenceEnquiry.service';
import {
  ListResidenceEnquiryDto,
  listResidenceEnquirySchema,
} from './dto/list-residenceEnquiry.dto';
import { AddResidenceEnquiryDto, addResidenceEnquirySchema } from './dto/add-residenceEnquiry.dto';

@ApiTags('ResidenceEnquiry')
@Controller('residence-enquiry')
export class ResidenceEnquiryController {
  constructor(private readonly residenceEnquiryService: ResidenceEnquiryService) {}

  @Post()
  @ApiOperation({
    summary: 'Add a enquiry ',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(addResidenceEnquirySchema, 'body'))
  async addUnit(@Body() addResidenceEnquiryDto: AddResidenceEnquiryDto) {
    const residenceEnquiry =
      await this.residenceEnquiryService.addResidenceEnquiry(addResidenceEnquiryDto);
    return ResponseService.buildResponse(
      { residenceEnquiry },
      'residenceEnquiry added successfully'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all ResidenceEnquiry',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listResidenceEnquirySchema, 'query'))
  async list(@Query() listResidenceEnquiryDto: ListResidenceEnquiryDto) {
    const residenceEnquirys = await this.residenceEnquiryService.findAll(listResidenceEnquiryDto);
    return ResponseService.buildResponse(
      { residenceEnquirys },
      'residenceEnquirys retrieved successfully'
    );
  }
}
