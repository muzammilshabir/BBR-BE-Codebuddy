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
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateVacancyDepartmentDto } from './dto/update-vacancy-department.dto';
import { VacancyApplication } from './schema/vacancy-application.schema';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateVacancyApplicationDto } from './dto/update-vacancy-application.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailEvent } from 'src/mailer/events/send-email.event';

@Injectable()
export class CareerService {

  constructor(
    private readonly vacancyRepository: VacancyRepository,
    private readonly vacancyApplicationRepository: VacancyApplicationRepository,
    private readonly vacancyDepartmentRepository: VacancyDepartmentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createVacancy(createJobPostDto: CreateJobPostDto): Promise<Vacancy> {
    const transformedDto = {
      ...createJobPostDto,
      department: new Types.ObjectId(createJobPostDto.department),
    };

    return this.vacancyRepository.create(transformedDto);
  }

  async updateVacancy(
    id: string,
    updateVacancyDto: UpdateVacancyDto,
  ): Promise<Vacancy> {
    const transformedDto: any = {
      ...updateVacancyDto,
      department: updateVacancyDto.department
        ? new Types.ObjectId(updateVacancyDto.department)
        : undefined,
    };

    const existingVacancy = await this.vacancyRepository.update(id, transformedDto);
    if (!existingVacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }
    return existingVacancy;
  }

  async closeVacancy(
    id: string,
  ): Promise<Vacancy> {
    const closeVacancyDto: any = {
      isDeleted: DeletionStatus.DELETED,
    };

    const existingVacancy = await this.vacancyRepository.update(id, closeVacancyDto);
    if (!existingVacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }
    return existingVacancy;
  }

  async updateApplication(
    id: string,
    updateVacancyApplicationDto: UpdateVacancyApplicationDto,
  ): Promise<VacancyApplication> {

    const existingApplication = await this.vacancyApplicationRepository.update(id, updateVacancyApplicationDto);
    if (!existingApplication) {
      throw new NotFoundException(`Job Application with ID ${id} not found`);
    }
    return existingApplication;
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateVacancyDepartmentDto,
  ): Promise<VacancyDepartment> {

    const existingDepartment = await this.vacancyDepartmentRepository.update(id, updateDepartmentDto);
    if (!existingDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return existingDepartment;
  }

  async deleteDepartment(
    id: string,
  ): Promise<VacancyDepartment> {
    const deleteDepartmentDto: any = {
      isDeleted: DeletionStatus.DELETED,
    };

    const existingDepartment = await this.vacancyDepartmentRepository.update(id, deleteDepartmentDto);
    if (!existingDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return existingDepartment;
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

  private async sendJobApplicationEmail(
    email: string,
    name: string,
    vacancy: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          vacancy,
        },
        template: 'job-application',
        subject: `Successfully Applied to ${vacancy}`,
        toEmail: email,
      })
    );
  }

  async createApplication(createJobApplicationDto: CreateJobApplicationDto): Promise<VacancyApplication> {
    const transformedDto = {
      ...createJobApplicationDto,
      resume: new Types.ObjectId(createJobApplicationDto.resume),
      vacancy: new Types.ObjectId(createJobApplicationDto.vacancy),
    };
    const vacancy = await this.vacancyRepository.findById(createJobApplicationDto.vacancy.toString());
    const application = await this.vacancyApplicationRepository.create(transformedDto);
    await this.sendJobApplicationEmail(
      createJobApplicationDto.email,
      createJobApplicationDto.fullName,
      vacancy.title,
    );
    return application;
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
