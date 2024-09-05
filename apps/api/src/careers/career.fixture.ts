import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { Vacancy } from './schema/vacancy.schema';
import { VacancyDepartment } from './schema/vacancy-department.schema';
import { VacancyApplication } from './schema/vacancy-application.schema';
import { UploadFixture } from 'src/upload/upload.fixture';
import { ApplicationStatus } from './enum/application-status.enum';

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
    // Create a new Career Category document
    const vacancyDepartment1 = await this.vacancyDepartmentModel.create({
      title: "Sales",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Create a new Vacancy document
    const vacancy1 = await this.vacancyModel.create({
      title: "Sales Executive",
      tagLine: "Digital Marketing Campaign Executive",
      description: "Lorem ipsum dolor sit ...",
      skills: ['CRM', 'MS Office'],
      department: vacancyDepartment1._id,
      isDeleted: false,
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
