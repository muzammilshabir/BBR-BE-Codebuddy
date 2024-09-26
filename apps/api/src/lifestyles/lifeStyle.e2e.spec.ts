import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { LifeStyleFixture } from './lifeStyle.fixture';

describe('AmenityModule', () => {
  const app = new TestSuiteBBR(AppModule, [LifeStyleFixture]);
  const url = '/lifestyles';

  describe('Find all lifeStyles', () => {
    it('Should find all lifeStyles', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(8);
    });
  });

  describe('Search lifeStyles', () => {
    it('Should find lifeStyles by search term', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=Golf`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.lifeStyles[0].name).toEqual('Golf Residences');
    });
  });
});
