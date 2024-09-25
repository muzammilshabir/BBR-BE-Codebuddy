import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { ResidenceFeatureFixture } from './residenceFeature.fixture';

describe('ResidenceFeatureModule', () => {
  const app = new TestSuiteBBR(AppModule, [ResidenceFeatureFixture]);
  const url = '/residence-feature';

  describe('Find all Residence Features', () => {
    it('Should find all Residence Features', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(3);
      expect(res.body.data.residenceFeature[0].name).toEqual('Parking');
      expect(res.body.data.residenceFeature[1].name).toEqual('Gym');
      expect(res.body.data.residenceFeature[2].name).toEqual('Swimming Pool');
    });
  });

  describe('Search Residence Features', () => {
    it('Should find Residence Features by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Gym`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.residenceFeature[0].name).toEqual('Gym');
    });
  });
});
