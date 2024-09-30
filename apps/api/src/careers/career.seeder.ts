import { Injectable, Logger } from '@nestjs/common';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { Types } from 'mongoose';
import { VacancyRepository } from './vacancy.repository';
import { VacancyDepartmentRepository } from './vacancy-department.repository';
import { VacancyApplicationRepository } from './vacancy-application.repository';
import { ApplicationStatus, JobStatus, JobType } from './enum/career.enum';

@Injectable()
export class CareerSeeder extends AbstractSeeder {
  public name = CareerSeeder.name;
  private readonly logger = new Logger(CareerSeeder.name);

  constructor(
    private readonly vacancyRepository: VacancyRepository,
    private readonly vacancyDepartmentRepository: VacancyDepartmentRepository,
    private readonly vacancyApplicationRepository: VacancyApplicationRepository,
  ) {
    super();
  }

  async seed() {
    try {
      const careersDepartments = [
        {
          title: "Sales",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const categories = [];
      for (const department of careersDepartments) {
        categories.push(await this.vacancyDepartmentRepository.upsert({ title: department.title }, department));
      }
      const today = new Date();
      const postedOn1 = (new Date).setDate(today.getDate() + 10);
      const postedOn2 = (new Date).setDate(today.getDate() + 2);
      const vacancies = [
        {
          title: "Sales Executive",
          tagLine: "Digital Marketing Campaign Executive",
          location: "Remote",
          isRemote: true,
          type: JobType.CONTRACT,
          status: JobStatus.ACTIVE,
          jobPicture: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd'),
          description: "Lorem ipsum dolor sit ...",
          responsibilities: "Lorem ipsum dolor sit ...",
          qualifications: "Lorem ipsum dolor sit ...",
          linkedin: 'https://linkedin.com/in/test2',
          skills: ['CRM', 'MS Office'],
          department: categories[0]._id,
          postedOn: postedOn1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "PPC Expert",
          tagLine: "Customer Service Role",
          location: "Paris, France",
          isRemote: false,
          type: JobType.PART_TIME,
          status: JobStatus.DRAFT,
          jobPicture: new Types.ObjectId('60d5f485f7c6a4b2b8e8b5fd'),
          description: "Lorem ipsum dolor sit ...",
          responsibilities: "Lorem ipsum dolor sit ...",
          qualifications: "Lorem ipsum dolor sit ...",
          skills: ['ads', 'cpr', 'cpa'],
          linkedin: 'https://linkedin.com/in/test',
          department: categories[0]._id,
          isDeleted: false,
          postedOn: postedOn2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const jobs = [];
      for (const vacancy of vacancies) {
        jobs.push(await this.vacancyRepository.upsert({ title: vacancy.title }, vacancy));
      }
      const jobApplications = [
        {
          fullName: "John Smith",
          email: "john@example.com",
          location: "NYC",
          resume: new Types.ObjectId("66acda8b857c576159b742a2"),
          vacancy: jobs[0]._id,
          status: ApplicationStatus.PENDING,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const application of jobApplications) {
        await this.vacancyApplicationRepository.upsert({ email: application.email }, application);
      }
    } catch (error) {
      this.logger.error('Error seeding careers', error);
    }
  }
}