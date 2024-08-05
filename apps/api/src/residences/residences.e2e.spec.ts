import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { ResidencesFixture } from './residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

describe('ResidenceController', () => {
  const app = new TestSuite(AppModule, [
    ResidencesFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture
  ]);
  const url = '/residence';

  describe('Create Residence', () => {
    it('Should create a new Residence', async () => {
      const location = app.getReference(LocationFixture.TAG_UAE);
      const createResidenceDto = {
        name: 'Ritz Carlton Miami',
        // residenceTypeId: residenceType._id,
        residenceTypeId: '60d9c6a0a11c3c6c6a9a1a2a',
        // locationId: location._id,
        locationId: location.id,
        websiteLink: 'https://dummywebsite.com',
        // associatedBrandId: brand._id,
        associatedBrandId: '60d9c6a0a11c3c6c6a9a1a1b',
        briefOverview: {
          subtitle: 'Beautiful Residence',
          briefDescription: 'A luxurious residence with beautiful views.'
        },
        comprehensiveOverview: {
          subtitle: 'Luxurious Residence',
          generalDescription: 'Located in the heart of the city.',
          community: 'Upscale community.',
          recentRenovation: 'Renovated in 2022.',
          localAttractions: 'Close to parks and shopping centers.',
          futureDevelopmentPlans: 'New development projects in the vicinity.'
        },
        budgetLimitationsRange: {
          startRange: 500000,
          endRange: 1000000
        },
      };

      // Convert the createResidenceDto to a JSON string
      const body = JSON.stringify(createResidenceDto);

      // Send POST request
      const res = await app.exec('POST', url, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: body 
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });
});
