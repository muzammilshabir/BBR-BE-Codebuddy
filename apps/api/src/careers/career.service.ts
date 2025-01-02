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
import { ApplicationStatus, JobStatus } from './enum/career.enum';
import { VacancyActivityLogRepository } from 'src/vacancy-activity-log/vacancy-activity-log.repository';

@Injectable()
export class CareerService {
  constructor(
    private readonly vacancyRepository: VacancyRepository,
    private readonly vacancyApplicationRepository: VacancyApplicationRepository,
    private readonly vacancyDepartmentRepository: VacancyDepartmentRepository,
    private readonly vacancyActivityLogRepository: VacancyActivityLogRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createVacancy(createJobPostDto: CreateJobPostDto, userId: string): Promise<Vacancy> {
    const transformedDto = {
      ...createJobPostDto,
      location: createJobPostDto.isRemote ? 'Remote' : createJobPostDto.location,
      jobPicture: new Types.ObjectId(createJobPostDto.jobPicture),
      department: new Types.ObjectId(createJobPostDto.department),
    };

    const vacancy = await this.vacancyRepository.create(transformedDto);

    await this.vacancyActivityLogRepository.create({
      vacancyId: new Types.ObjectId(vacancy.id),
      activityType: 'Created',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return vacancy;
  }

  async updateVacancy(
    id: string,
    updateVacancyDto: UpdateVacancyDto,
    userId: string
  ): Promise<Vacancy> {
    const transformedDto: any = {
      ...updateVacancyDto,
      location: updateVacancyDto.isRemote ? 'Remote' : updateVacancyDto.location,
      department: updateVacancyDto.department
        ? new Types.ObjectId(updateVacancyDto.department)
        : undefined,
      jobPicture: updateVacancyDto.jobPicture
        ? new Types.ObjectId(updateVacancyDto.jobPicture)
        : undefined,
    };

    const existingVacancy = await this.vacancyRepository.update(id, transformedDto);
    if (!existingVacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    await this.vacancyActivityLogRepository.create({
      vacancyId: new Types.ObjectId(existingVacancy.id),
      activityType: 'Details edited',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return existingVacancy;
  }

  async closeVacancy(id: string, userId: string): Promise<Vacancy> {
    const closeVacancyDto: any = {
      isDeleted: DeletionStatus.DELETED,
      status: JobStatus.ARCHIVED,
    };

    const existingVacancy = await this.vacancyRepository.update(id, closeVacancyDto);
    if (!existingVacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    await this.vacancyActivityLogRepository.create({
      vacancyId: new Types.ObjectId(existingVacancy.id),
      activityType: 'Closed',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return existingVacancy;
  }

  async updateApplication(
    id: string,
    updateVacancyApplicationDto: UpdateVacancyApplicationDto,
    userId: string
  ): Promise<VacancyApplication> {
    const existingApplication = await this.vacancyApplicationRepository.update(
      id,
      updateVacancyApplicationDto
    );
    if (!existingApplication) {
      throw new NotFoundException(`Job Application with ID ${id} not found`);
    }

    if (updateVacancyApplicationDto.status === ApplicationStatus.SHORT_LISTED) {
      await this.vacancyActivityLogRepository.create({
        vacancyId: new Types.ObjectId(existingApplication.vacancy?.id),
        activityType: 'Approved',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    return existingApplication;
  }

  async updateDepartment(
    id: string,
    updateDepartmentDto: UpdateVacancyDepartmentDto
  ): Promise<VacancyDepartment> {
    const existingDepartment = await this.vacancyDepartmentRepository.update(
      id,
      updateDepartmentDto
    );
    if (!existingDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return existingDepartment;
  }

  async deleteDepartment(id: string): Promise<VacancyDepartment> {
    const deleteDepartmentDto: any = {
      isDeleted: DeletionStatus.DELETED,
    };
    const jobs = await this.vacancyRepository.findAll({
      department: id,
    });
    for (const job of jobs.data) {
      await this.vacancyRepository.update(job.id, {
        status: JobStatus.ARCHIVED,
      });
    }

    const existingDepartment = await this.vacancyDepartmentRepository.update(
      id,
      deleteDepartmentDto
    );
    if (!existingDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return existingDepartment;
  }

  async createDepartment(
    createCareerDepartmentDto: CreateCareerDepartmentDto
  ): Promise<VacancyDepartment> {
    return this.vacancyDepartmentRepository.create(createCareerDepartmentDto);
  }

  async getJobApplications(getJobApplicationsDto: GetJobApplicationsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if (getJobApplicationsDto.vacancyId) {
      filter.vacancyId = getJobApplicationsDto.vacancyId;
    }

    const options = PaginationService.prepareOptions(getJobApplicationsDto);

    const { data, count } = await this.vacancyApplicationRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, getJobApplicationsDto);

    return { pagination, applications: data };
  }

  private async sendJobApplicationEmail(email: string, name: string, vacancy: string) {
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

  async createApplication(
    createJobApplicationDto: CreateJobApplicationDto
  ): Promise<VacancyApplication> {
    const transformedDto = {
      ...createJobApplicationDto,
      resume: new Types.ObjectId(createJobApplicationDto.resume),
      vacancy: new Types.ObjectId(createJobApplicationDto.vacancy),
    };
    const vacancy = await this.vacancyRepository.findById(
      createJobApplicationDto.vacancy.toString()
    );
    const application = await this.vacancyApplicationRepository.create(transformedDto);
    await this.sendJobApplicationEmail(
      createJobApplicationDto.email,
      createJobApplicationDto.fullName,
      vacancy.title
    );

    await this.vacancyActivityLogRepository.create({
      vacancyId: new Types.ObjectId(vacancy.id),
      activityType: 'New applicant received',
      createdAt: new Date(),
    });

    return application;
  }

  async listVacancies(listVacanciesDto: ListVacanciesDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      status: JobStatus.ACTIVE,
      postedOn: { $lt: new Date() },
    };

    if (listVacanciesDto.search) {
      filter.$or = [
        { title: { $regex: listVacanciesDto.search, $options: 'i' } },
        { description: { $regex: listVacanciesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listVacanciesDto);

    const { data, count } = await this.vacancyRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listVacanciesDto);

    return { pagination, jobs: data };
  }

  async adminListVacancies(listVacanciesDto: ListVacanciesDto) {
    const filter: any = {};

    if (listVacanciesDto.search) {
      filter.$or = [
        { title: { $regex: listVacanciesDto.search, $options: 'i' } },
        { description: { $regex: listVacanciesDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listVacanciesDto);

    const { data, count } = await this.vacancyRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listVacanciesDto);

    return { pagination, jobs: data };
  }
}
