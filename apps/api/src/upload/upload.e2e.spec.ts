import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { UploadFixture } from './upload.fixture';

describe('UploadModule', () => {
  const app = new TestSuite(AppModule, [UploadFixture]);
  const url = '/upload';

  describe('Find all Uploads', () => {
    it('Should find all Uploads', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toBeGreaterThan(0);
    });
  });


});