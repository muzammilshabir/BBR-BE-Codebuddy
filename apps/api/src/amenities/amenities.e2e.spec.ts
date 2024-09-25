import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { AmenityFixture } from './amenities.fixture';

describe('AmenityModule', () => {
  const app = new TestSuiteBBR(AppModule, [AmenityFixture]);
  const url = '/amenities';

  describe('Find all Amenities', () => {
    it('Should find all Amenities', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(4);
      expect(res.body.data.amenities[0].name).toEqual('Golf course access');
      expect(res.body.data.amenities[1].name).toEqual('Gym/Fitness center');
      expect(res.body.data.amenities[2].name).toEqual('Private Beach access');
      expect(res.body.data.amenities[3].name).toEqual('Swimming pool');
    });
  });

  describe('Search Amenities', () => {
    it('Should find Amenities by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Golf`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.amenities[0].name).toEqual('Golf course access');
    });
  });
});