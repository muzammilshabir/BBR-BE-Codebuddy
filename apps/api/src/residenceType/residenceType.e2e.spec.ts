import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { ResidenceTypeFixture } from './residenceType.fixture';

describe('ResidenceTypeModule', () => {
  const app = new TestSuiteBBR(AppModule, [ResidenceTypeFixture]);
  const url = '/residence-type';

  describe('Find all Residence Types', () => {
    it('Should find all Residence Types', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(3);
      expect(res.body.data.residenceType[0].type).toEqual('Rooftop');
      expect(res.body.data.residenceType[1].type).toEqual('Garden');
    });
  });

  describe('Search Residence Types', () => {
    it('Should find Residence Types by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Rooftop`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.residenceType[0].type).toEqual('Rooftop');
    });
  });

});
