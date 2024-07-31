import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { ResidenceTypeFixture } from './residenceType.fixture';
import { ResidenceType } from './schema/residenceType.schema';

describe('ResidenceTypeModule', () => {
  const app = new TestSuite(AppModule, [ResidenceTypeFixture]);

  describe('Find all Residence Types', () => {
    const url = '/residence-type';
    it('Should find all Residence Types', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      console.log('res.body.data.pagination :>> ', res.body.data.pagination);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.residenceType[0].type).toEqual('Balcony/Terrace');
    });
  });
});