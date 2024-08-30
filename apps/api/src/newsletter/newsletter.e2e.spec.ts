import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { UploadFixture } from '../upload/upload.fixture';
import { ResidencesFixture } from '../residences/residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

describe('NewsletterModule', () => {
  const app = new TestSuite(AppModule, [
    ResidencesFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture,
  ]);
  const url = '/newsletter';

  describe('Subscribe to Newsletter', () => {
    it('Should subscribe to BBR newsletter', async () => {
      const subscribeNewsletterDtop = {
        email: "test@example.com",
      };

      // Convert the subscribeNewsletterDtop to a JSON string
      const body = JSON.stringify(subscribeNewsletterDtop);

      // Send POST request
      const res = await app.exec('POST', `${url}/subscribe`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

  describe('Unsubscribe to Newsletter', () => {
    it('Should unsubscribe from BBR newsletter', async () => {
      const unsubscribeNewsletterDtop = {
        email: "test@example.com",
      };

      // Convert the unsubscribeNewsletterDtop to a JSON string
      const body = JSON.stringify(unsubscribeNewsletterDtop);

      // Send POST request
      const res = await app.exec('POST', `${url}/unsubscribe`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

});
