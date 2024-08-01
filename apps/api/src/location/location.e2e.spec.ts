import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { LocationFixture } from './location.fixture';

describe('LocationModule', () => {
  const app = new TestSuite(AppModule, [LocationFixture]);
  const url = '/location';

  describe('Find all Locations', () => {
    it('Should find all Locations', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(7);
      expect(res.body.data.locations[0].name).toEqual('Bangkok');
      expect(res.body.data.locations[1].name).toEqual('New York');
      expect(res.body.data.locations[2].name).toEqual('Miami');
      expect(res.body.data.locations[3].name).toEqual('Dubai');
      expect(res.body.data.locations[4].name).toEqual('Thailand');
      expect(res.body.data.locations[5].name).toEqual('USA');
      expect(res.body.data.locations[6].name).toEqual('UAE');
    });
  });

  describe('Search Locations', () => {
    it('Should find Locations by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Bangkok`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.locations[0].name).toEqual('Bangkok');
    });
  });

});