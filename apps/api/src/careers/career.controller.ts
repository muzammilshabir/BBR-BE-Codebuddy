import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, UsePipes, Get, Query, Put, Param, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CareerService } from './career.service';
import { GetJobApplicationsDto, getJobApplicationsSchema } from './dto/get-job-applications.dto';
import { ListVacanciesDto, listVacanciesSchema } from './dto/list-vacancies.dto';
import { CreateJobPostDto, createJobPostDtoSchema } from './dto/create-job-post.dto';
import { CreateCareerDepartmentDto, createCareerDepartmentDtoSchema } from './dto/create-career-department.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/user.enum';
import { UpdateVacancyDto, updateVacancyDtoSchema } from './dto/update-vacancy.dto';
import { UpdateVacancyDepartmentDto, updateVacancyDepartmentDtoSchema } from './dto/update-vacancy-department.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateJobApplicationDto, createJobApplicationDtoSchema } from './dto/create-job-application.dto';
import { UpdateVacancyApplicationDto, updateVacancyApplicationDtoSchema } from './dto/update-vacancy-application.dto';

@ApiTags('Career')
@Controller('career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Post('/admin/create/vacancy')
  @ApiOperation({
    summary: 'Create new Job Post',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
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
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(createCareerDepartmentDtoSchema, 'body'))
  async createDepartment(
    @Body() createCareerDepartmentDto: CreateCareerDepartmentDto,
    ) {
    const result = await this.careerService.createDepartment(createCareerDepartmentDto);
    return ResponseService.buildResponse({ result }, 'Successfully created new Careers Department!');
  }

  @Put('/admin/vacancy/:id')
  @ApiOperation({
    summary: 'Update Vacancy',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateVacancyDtoSchema, 'body'))
  async updateVacancy(
    @Param('id') id: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    const vacancy = await this.careerService.updateVacancy(id, updateVacancyDto);
    return ResponseService.buildResponse({ vacancy }, 'Vacancy updated successfully');
  }

  @Put('/admin/department/:id')
  @ApiOperation({
    summary: 'Update Department',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateVacancyDepartmentDtoSchema, 'body'))
  async updateDepartment(
    @Param('id') id: string,
    @Body() updateVacancyDepartmentDto: UpdateVacancyDepartmentDto,
  ) {
    const department = await this.careerService.updateVacancy(id, updateVacancyDepartmentDto);
    return ResponseService.buildResponse({ department }, 'Vacancy Department updated successfully');
  }

  @Put('/admin/application/:id')
  @ApiOperation({
    summary: 'Update Application',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(updateVacancyApplicationDtoSchema, 'body'))
  async updateApplication(
    @Param('id') id: string,
    @Body() updateVacancyApplicationDto: UpdateVacancyApplicationDto,
  ) {
    const application = await this.careerService.updateApplication(id, updateVacancyApplicationDto);
    return ResponseService.buildResponse({ application }, 'Job Application updated successfully');
  }

  @Delete('/admin/vacancy/:id')
  @ApiOperation({
    summary: 'Delete/Close a Vacancy',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async closeVacancy(
    @Param('id') id: string,
  ) {
    const vacancy = await this.careerService.closeVacancy(id);
    return ResponseService.buildResponse({ vacancy }, 'Vacancy Closed successfully');
  }

  @Delete('/admin/department/:id')
  @ApiOperation({
    summary: 'Delete a Department',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async deleteDepartment(
    @Param('id') id: string,
  ) {
    const department = await this.careerService.deleteDepartment(id);
    return ResponseService.buildResponse({ department }, 'Department deleted successfully');
  }

  @Get('/admin/get/applications')
  @ApiOperation({
    summary: 'Get Job Applications',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getJobApplicationsSchema, 'query'))
  async getJobApplications(
    @Query() query: GetJobApplicationsDto,
    ) {
    const result = await this.careerService.getJobApplications(query);
    return ResponseService.buildResponse({ result });
  }

  @Post('/apply')
  @ApiOperation({
    summary: 'Apply for a Job',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createJobApplicationDtoSchema, 'body'))
  async createApplication(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    ) {
    const result = await this.careerService.createApplication(createJobApplicationDto);
    return ResponseService.buildResponse({ result }, 'Successfully Applied for Job!');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Job Posts',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listVacanciesSchema, 'query'))
  async listVacancies(@Query() query: ListVacanciesDto) {
    const posts = await this.careerService.listVacancies(query);
    return ResponseService.buildResponse(posts);
  }
}
