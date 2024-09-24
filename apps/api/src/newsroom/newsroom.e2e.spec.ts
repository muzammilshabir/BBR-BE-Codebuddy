import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { UploadFixture } from '../upload/upload.fixture';
import { NewsroomFixture } from './newsroom.fixture';

describe('NewsroomModule', () => {
  const app = new TestSuite(AppModule, [
    NewsroomFixture,
    UploadFixture,
  ]);
  const url = '/newsroom';

  describe('Create new Press Release!', () => {
    it('Should create new Newsroom Post!', async () => {
      const newsroomCategory = app.getReference(NewsroomFixture.NewsroomCategory_1);
      const photo = app.getReference(UploadFixture.UPLOAD_1);
      const featuredImg = app.getReference(UploadFixture.UPLOAD_2);
      const createNewsroomPostDto = {
        author: {
          name: "Nick Jameson",
          photo: photo.id,
        },
        title: "BBR Press Release!",
        category: newsroomCategory.id,
        featuredImage: featuredImg.id,
        contents: "Lorem ipsum dolor sit ...",
      };

      // Convert the createNewsroomPostDto to a JSON string
      const body = JSON.stringify(createNewsroomPostDto);

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

  describe('Create Newsroom Category', () => {
    it('Should create new Newsroom Category', async () => {
      const createNewsroomCategoryDto = {
        title: "Marketing",
      };

      // Convert the createNewsroomCategoryDto to a JSON string
      const body = JSON.stringify(createNewsroomCategoryDto);

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
  describe('Get latest Posts from Newsroom', () => {
    it('Should find Posts from Newsroom', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=asc`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].newsroom.title).toEqual('BBR Newsroom Post!');
    });
  });

  describe('Search Newsroom posts', () => {
    it('Should find Newsroom posts by search keywords', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&search=ipsum`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.posts[0].newsroom.title).toEqual('BBR Newsroom Post!');
    });
  });

  describe('Get Related Newsroom posts', () => {
    it('Should find newsroom posts related to the provided id', async () => {
      const newsroomPost = app.getReference(NewsroomFixture.Newsroom_1);
      const urlWithParams = `${url}/related?postId=${newsroomPost.id}`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(404);
    });
  });

});
