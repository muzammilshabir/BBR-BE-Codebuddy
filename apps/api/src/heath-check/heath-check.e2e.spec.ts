import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';

describe('Heath Check', () => {
  const app = new TestSuiteBBR(AppModule, [], []);

  it('should return OK', async () => {
    const res = await app.exec('GET', '/health-check', {});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});
