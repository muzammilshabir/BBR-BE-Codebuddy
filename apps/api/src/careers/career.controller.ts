import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CareerService } from './career.service';
import { GetJobApplicationsDto, getJobApplicationsSchema } from './dto/get-job-applications.dto';
import { ListVacanciesDto, listVacanciesSchema } from './dto/list-vacancies.dto';
import { CreateJobPostDto, createJobPostDtoSchema } from './dto/create-job-post.dto';
import { CreateCareerDepartmentDto, createCareerDepartmentDtoSchema } from './dto/create-career-department.dto';

@ApiTags('Career')
@Controller('career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Post('/admin/create/vacancy')
  @ApiOperation({
    summary: 'Create new Job Post',
  })
  @UsePipes(new JoiValidationPipe(createJobPostDtoSchema, 'body'))
  async createVacancy(
    @Body() createJobPostDto: CreateJobPostDto,
    ) {
    const result = await this.careerService.createVacancy(createJobPostDto);
    return ResponseService.buildResponse({ result }, 'Successfully created new Job Post!');
  }

  @Post('/admin/create/department')
  @ApiOperation({
    summary: 'Create new Career Department',
  })
  @UsePipes(new JoiValidationPipe(createCareerDepartmentDtoSchema, 'body'))
  async createDepartment(
    @Body() createCareerDepartmentDto: CreateCareerDepartmentDto,
    ) {
    const result = await this.careerService.createDepartment(createCareerDepartmentDto);
    return ResponseService.buildResponse({ result }, 'Successfully created new Careers Department!');
  }

  @Get('/admin/get/applications')
  @ApiOperation({
    summary: 'Get Job Applications',
  })
  @UsePipes(new JoiValidationPipe(getJobApplicationsSchema, 'query'))
  async getJobApplications(
    @Query() query: GetJobApplicationsDto,
    ) {
    const result = await this.careerService.getJobApplications(query);
    return ResponseService.buildResponse({ result });
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Job Posts',
  })
  @UsePipes(new JoiValidationPipe(listVacanciesSchema, 'query'))
  async listVacancies(@Query() query: ListVacanciesDto) {
    const posts = await this.careerService.listVacancies(query);
    return ResponseService.buildResponse(posts);
  }
}
