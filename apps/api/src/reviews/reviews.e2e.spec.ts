import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { ReviewsFixture } from './reviews.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { ResidencesFixture } from '../residences/residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

describe('ReviewModule', () => {
  const app = new TestSuite(AppModule, [
    ReviewsFixture,
    ResidencesFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture,
  ]);
  const url = '/review';

  describe('Create Review', () => {
    it('Should create a new Review', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const reviewImage = app.getReference(UploadFixture.UPLOAD_1);
      const createReviewDto = {
        rating: "4",
        residence: residence.id,
        review: {
          title: 'Awesome Experience',
          details: 'This is a very nice place and the seller was very nice.',
        },
        photos: [reviewImage.id],
      };

      // Convert the createReviewDto to a JSON string
      const body = JSON.stringify(createReviewDto);

      // Send POST request
      const res = await app.exec('POST', url, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });
  describe('Request Review', () => {
    it('Should request Review from buyer', async () => {
      // User Fixture Required
    });
  });
  describe('Respond to Review', () => {
    it('Should respond to a Review from Buyer', async () => {
      // User Fixture Required
    });
  });

  describe('Find all Reviews For Residence', () => {
    it('Should find all Reviews for a residence', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=asc&residenceId=${residence.id}`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(3);
      expect(res.body.data.reviews[0].review.title).toEqual('Beautiful Place');
      expect(res.body.data.reviews[0].rating).toEqual(5);
    });
  });

  describe('Search Reviews', () => {
    it('Should find Reviews by search term and Residence Id', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&residenceId=${residence.id}&search=Average`;
      const res = await app.exec('GET', urlWithParams, { headers: {} });

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.totalDocs).toEqual(1);
      expect(res.body.data.reviews[0].rating).toEqual(3);
    });
  });

  describe('Get Review by Id', () => {
    it('Should find Review by Id', async () => {
      const review = app.getReference(ReviewsFixture.REVIEW_1);
      const res = await app.exec('GET', `${url}/${review.id}`, {
        headers: {
        'Content-Type': 'application/json',
      } });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Review retrieved successfully");
    });

    it('Should return 404 if Review ID does not exist', async () => {
      const nonExistentId = '60f9c1e07c8b4b001c5d9c39';

      // Send GET request with a non-existent ID
      const res = await app.exec('GET', `${url}/${nonExistentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Review with ID ${nonExistentId} not found`);
    });
  });
  describe('Get Reviews Stats by Residence', () => {
    it('Should find Review stats for Residence', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const res = await app.exec('GET', `${url}/stats/${residence.id}`, {
        headers: {
        'Content-Type': 'application/json',
      } });

      expect(res.status).toBe(200);
      expect(res.body.data.reviewStats.totalReviews).toEqual(3);
    });
    it('Should not find Review stats for Residence', async () => {
      const res = await app.exec('GET', `${url}/stats/66c2bfdd855e053db5c49903`, {
        headers: {
        'Content-Type': 'application/json',
      } });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Review Stats for Residence not found");
    });
  });

  describe('Update Review Flag', () => {
    it('Should update the Flag of an existing Review', async () => {
      const existingReview = app.getReference(ReviewsFixture.REVIEW_1);

      // Send PUT request to update the residence status
      const res = await app.exec('PUT', `${url}/flag/${existingReview.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Review flagged successfully');
    });

    it('Should return 404 if the Residence ID does not exist', async () => {
      const nonExistentId = '60f9c1e07c8b4b001c5c9c99';

      const res = await app.exec('PUT', `${url}/flag/${nonExistentId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Review with ID ${nonExistentId} not found`);
    });
  });
});
