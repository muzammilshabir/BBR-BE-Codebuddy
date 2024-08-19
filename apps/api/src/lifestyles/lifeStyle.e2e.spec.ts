import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { LifeStyleFixture } from './lifeStyle.fixture';

describe('AmenityModule', () => {
  const app = new TestSuite(AppModule, [LifeStyleFixture]);
  const url = '/lifestyles';

  describe('Find all lifeStyles', () => {
    it('Should find all lifeStyles', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(8);
      expect(res.body.data.lifeStyles[0].name).toEqual('Investment Opportunities');
      expect(res.body.data.lifeStyles[1].name).toEqual('Newest Branded Residences');
      expect(res.body.data.lifeStyles[2].name).toEqual('Pet Friendly Residences');
      expect(res.body.data.lifeStyles[3].name).toEqual('Beachfront Residences');
      expect(res.body.data.lifeStyles[3].name).toEqual('Golf Residences');
      expect(res.body.data.lifeStyles[3].name).toEqual('Emerging Markets');
      expect(res.body.data.lifeStyles[3].name).toEqual('Best for Couples');
      expect(res.body.data.lifeStyles[3].name).toEqual('Ski Resort');
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