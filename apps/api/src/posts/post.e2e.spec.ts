import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { PostFixture } from './post.fixture';

describe('PostModule', () => {
  const app = new TestSuite(AppModule, [PostFixture]);

  describe('Create posts', () => {
    const url = '/post';
    it('Should Create a Post successfully when all inputs are valid', async () => {
      const res = await app.exec('POST', url, {
        headers: {},
        data: {
          title: 'Test title',
          content: 'Test content',
        },
      });

      expect(res.status).toBe(201);
      expect(res.body.data.post).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          title: 'Test title',
          content: 'Test content',
        })
      );
    });
  });
});
