import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { PostFixture } from './post.fixture';
import { Post } from './post.schema';

describe('PostModule', () => {
  const app = new TestSuiteBBR(AppModule, [PostFixture]);

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

    it('Should find all Post', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;
      const res = await app.exec('GET', urlWithParams, {
        headers: {},
      });
      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].title).toEqual('Post 1');
    });

    it('Should find Post by id ', async () => {
      const post: Post = app.getReference(PostFixture.POST_1);
      const res = await app.exec('GET', url + '/' + post.id, {
        headers: {},
      });

      expect(res.status).toBe(200);
      expect(res.body.data.post._id).toEqual(post.id);
      expect(res.body.data.post.title).toEqual('Post 1');
    });

    it('Should Update post by id ', async () => {
      const post: Post = app.getReference(PostFixture.POST_1);
      const data = {
        title: 'Post 1',
        content: 'Content updated',
      };
      const res = await app.exec('PATCH', url + '/' + post.id, {
        headers: {},
        data: data,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.post._id).toEqual(post.id);
      expect(res.body.data.post).toMatchObject(data);
    });
  });
});
