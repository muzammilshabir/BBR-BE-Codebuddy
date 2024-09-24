import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { BrandFixture } from './brand.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { BrandCategoryFixture } from '../brandCategory/brandCategory.fixture';

describe('BrandModule', () => {
  const app = new TestSuite(AppModule, [BrandFixture, UploadFixture, BrandCategoryFixture]);
  const url = '/brand';

  describe('Find all Brands', () => {
    it('Should find all Brands', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(4);
      expect(res.body.data.brands[0].name).toEqual('Four Seasons');
      expect(res.body.data.brands[1].name).toEqual('Aston Martin');
      expect(res.body.data.brands[2].name).toEqual('The Ritz-Carlton');
      expect(res.body.data.brands[3].name).toEqual('Private Homes');
    });
  });

  describe('Search Brands', () => {
    it('Should find Brands by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Aston Martin`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.brands[0].name).toEqual('Aston Martin');
    });
  });
});
