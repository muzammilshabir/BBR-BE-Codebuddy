import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { UploadFixture } from '../upload/upload.fixture';
import { BlogFixture } from './blog.fixture';

describe('BlogModule', () => {
  const app = new TestSuite(AppModule, [
    BlogFixture,
    UploadFixture,
  ]);
  const url = '/blog';

  describe('Create new Blog Post!', () => {
    it('Should create new Blog Post!', async () => {
      const blogCategory = app.getReference(BlogFixture.BlogCategory_1);
      const photo = app.getReference(UploadFixture.UPLOAD_1);
      const featuredImg = app.getReference(UploadFixture.UPLOAD_2);
      const createBlogPostDto = {
        author: {
          name: "Nick Jameson",
          photo: photo.id,
        },
        title: "The Benefits of Living in a Gated Community!",
        category: blogCategory.id,
        featuredImage: featuredImg.id,
        contents: "Lorem ipsum dolor sit ...",
      };

      // Convert the createBlogPostDto to a JSON string
      const body = JSON.stringify(createBlogPostDto);

      // Send POST request
      const res = await app.exec('POST', `${url}/admin/create/post`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

  describe('Create Blog Category', () => {
    it('Should create new Blog Category', async () => {
      const createBlogCategoryDto = {
        title: "Marketing",
      };

      // Convert the createBlogCategoryDto to a JSON string
      const body = JSON.stringify(createBlogCategoryDto);

      // Send POST request
      const res = await app.exec('POST', `${url}/admin/create/category`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });
  describe('Get latest Posts from Blog', () => {
    it('Should find Posts from Blog', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=asc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].blog.title).toEqual('The Benefits of Living in a Gated Community!');
    });
  });

  describe('Search Blog posts', () => {
    it('Should find Blog posts by search keywords', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=ipsum`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].blog.title).toEqual('The Benefits of Living in a Gated Community!');
    });
  });

});
