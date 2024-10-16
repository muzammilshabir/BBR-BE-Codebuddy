import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { Vacancy } from './schema/vacancy.schema';
import { VacancyDepartment } from './schema/vacancy-department.schema';
import { VacancyApplication } from './schema/vacancy-application.schema';
import { UploadFixture } from 'src/upload/upload.fixture';
import { ApplicationStatus, JobStatus, JobType } from './enum/career.enum';

@Injectable()
export class CareerFixture extends AbstractFixture {
  public dependsOn = [
    UploadFixture,
  ];

  constructor(
    @InjectModel(Vacancy.name) private readonly vacancyModel: Model<Vacancy>,
    @InjectModel(VacancyApplication.name) private readonly vacancyApplicationModel: Model<VacancyApplication>,
    @InjectModel(VacancyDepartment.name) private readonly vacancyDepartmentModel: Model<VacancyDepartment>,
  ) {
    super();
  }
  name = CareerFixture.name;
  static Vacancy_1 = 'VACANCY_1';
  static VacancyApplication_1 = 'VACANCY_APPLICATION_1';
  static VacancyDepartment_1 = 'VACANCY_DEPARTMENT_1';
  async load() {
    const jobPhotoId = this.getReference(UploadFixture.UPLOAD_1)._id;
    // Create a new Career Category document
    const vacancyDepartment1 = await this.vacancyDepartmentModel.create({
      title: "Sales",
      isDeleted: false,
      createdById: '60d5f485f7c6a4b2b8e8b601',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Create a new Vacancy document
    const vacancy1 = await this.vacancyModel.create({
      title: "Sales Executive",
      tagLine: "Digital Marketing Campaign Executive",
      location: "Paris, France",
      isRemote: false,
      type: JobType.CONTRACT,
      status: JobStatus.ACTIVE,
      jobPicture: jobPhotoId,
      description: "Lorem ipsum dolor sit ...",
      responsibilities: "Lorem ipsum dolor sit ...",
      qualifications: "Lorem ipsum dolor sit ...",
      linkedin: 'https://linkedin.com/in/test',
      skills: ['CRM', 'MS Office'],
      department: vacancyDepartment1._id,
      isDeleted: false,
      postedOn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const CV = this.getReference(UploadFixture.UPLOAD_1)._id;
    // Create a new Vacancy Application document
    const vacancyApplication1 = await this.vacancyApplicationModel.create({
      fullName: "John Smith",
      email: "john@example.com",
      location: "NYC",
      resume: CV._id,
      vacancy: vacancy1._id,
      status: ApplicationStatus.PENDING,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    this.addReference(CareerFixture.VacancyDepartment_1, vacancyDepartment1);
    this.addReference(CareerFixture.Vacancy_1, vacancy1);
    this.addReference(CareerFixture.VacancyApplication_1, vacancyApplication1);
  }
}
