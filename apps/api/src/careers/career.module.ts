import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CareerService } from './career.service';
import { CareerController } from './career.controller';
import { CareerSeeder } from './career.seeder';
import { CareerFixture } from './career.fixture';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/users/user.module';
import { ResidenceModule } from 'src/residences/residences.module';
import { Vacancy, VacancySchema } from './schema/vacancy.schema';
import { VacancyApplication, VacancyApplicationSchema } from './schema/vacancy-application.schema';
import { VacancyDepartment, VacancyDepartmentSchema } from './schema/vacancy-department.schema';
import { VacancyRepository } from './vacancy.repository';
import { VacancyDepartmentRepository } from './vacancy-department.repository';
import { VacancyApplicationRepository } from './vacancy-application.repository';
import { VacancyActivityLog, VacancyActivityLogSchema } from 'src/vacancy-activity-log/schema/vacancy-activity-log.schema';
import { VacancyActivityLogRepository } from 'src/vacancy-activity-log/vacancy-activity-log.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Vacancy.name, schema: VacancySchema }]),
    MongooseModule.forFeature([{ name: VacancyApplication.name, schema: VacancyApplicationSchema }]),
    MongooseModule.forFeature([{ name: VacancyDepartment.name, schema: VacancyDepartmentSchema }]),
    MongooseModule.forFeature([{ name: VacancyActivityLog.name, schema: VacancyActivityLogSchema }]),
  ],
  providers: [
    CareerService,
    VacancyRepository,
    VacancyDepartmentRepository,
    VacancyApplicationRepository,
    VacancyActivityLogRepository,
    CareerSeeder,
    CareerFixture,
  ],
  exports: [CareerSeeder, CareerFixture],
  controllers: [CareerController],
})
export class CareerModule {}
