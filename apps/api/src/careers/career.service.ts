import { Injectable } from '@nestjs/common';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { Types } from 'mongoose';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { VacancyRepository } from './vacancy.repository';
import { VacancyApplicationRepository } from './vacancy-application.repository';
import { VacancyDepartmentRepository } from './vacancy-department.repository';
import { CreateJobPostDto } from './dto/create-job-post.dto';
import { Vacancy } from './schema/vacancy.schema';
import { VacancyDepartment } from './schema/vacancy-department.schema';
import { CreateCareerDepartmentDto } from './dto/create-career-department.dto';
import { ListVacanciesDto } from './dto/list-vacancies.dto';
import { GetJobApplicationsDto } from './dto/get-job-applications.dto';

@Injectable()
export class CareerService {

  constructor(
    private readonly vacancyRepository: VacancyRepository,
    private readonly vacancyApplicationRepository: VacancyApplicationRepository,
    private readonly vacancyDepartmentRepository: VacancyDepartmentRepository,
  ) {}

  async createVacancy(createJobPostDto: CreateJobPostDto): Promise<Vacancy> {
    const transformedDto = {
      ...createJobPostDto,
      department: new Types.ObjectId(createJobPostDto.department),
    };

    return this.vacancyRepository.create(transformedDto);
  }

  async createDepartment(createCareerDepartmentDto: CreateCareerDepartmentDto): Promise<VacancyDepartment> {    
    return this.vacancyDepartmentRepository.create(createCareerDepartmentDto);
  }

  async getJobApplications(getJobApplicationsDto: GetJobApplicationsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if(getJobApplicationsDto.vacancyId) {
      filter.vacancyId = getJobApplicationsDto.vacancyId;
    }

    const options = PaginationService.prepareOptions(getJobApplicationsDto);

    const { data, count } = await this.vacancyApplicationRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, getJobApplicationsDto);

    return { pagination, applications: data };
  }

  async listVacancies(listVacanciesDto: ListVacanciesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if(listVacanciesDto.search) {
      filter.$or = [
        { "career.title": { $regex: listVacanciesDto.search, $options: 'i' } },
        { "career.contents": { $regex: listVacanciesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listVacanciesDto);

    const { data, count } = await this.vacancyRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listVacanciesDto);

    return { pagination, jobs: data };
  }
}
