import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { UploadFixture } from '../upload/upload.fixture';
import { CareerFixture } from './career.fixture';

describe('CareerModule', () => {
  const app = new TestSuite(AppModule, [
    CareerFixture,
    UploadFixture,
  ]);
  const url = '/career';

  describe('Create new Job Post!', () => {
    it('Should create new Job Vacancy!', async () => {
      const department = app.getReference(CareerFixture.VacancyDepartment_1);
      const createVacancyDto = {
        title: "PPC Expert",
        tagLine: "Digital Marketing Campaign Executive",
        description: "Lorem ipsum dolor sit ...",
        skills: ['ads', 'cpr', 'cpa'],
        department: department.id,
      };

      // Convert the createVacancyDto to a JSON string
      const body = JSON.stringify(createVacancyDto);

      // Send POST request
      const res = await app.exec('POST', `${url}/admin/create/vacancy`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

  describe('Create Career Department', () => {
    it('Should create new Career Department', async () => {
      const createCareerCategoryDto = {
        title: "Sales",
      };

      // Convert the createCareerCategoryDto to a JSON string
      const body = JSON.stringify(createCareerCategoryDto);

      // Send POST request
      const res = await app.exec('POST', `${url}/admin/create/department`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });
  describe('Get latest Vacancies from Careers', () => {
    it('Should find Vacancies from Careers', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=asc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].career.title).toEqual('BBR Career Post!');
    });
  });

  describe('Search Vacancies', () => {
    it('Should find Vacancies by search keywords', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=ipsum`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].career.title).toEqual('Sales Executive');
    });
  });

});
