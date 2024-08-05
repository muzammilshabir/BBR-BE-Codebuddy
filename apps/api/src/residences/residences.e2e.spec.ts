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
    AmenityFixture,
  ]);
  const url = '/residence';

  describe('Create Residence', () => {
    it('Should create a new Residence', async () => {
      const location = app.getReference(LocationFixture.TAG_UAE);
      const residenceType = app.getReference(ResidenceTypeFixture.RESIDENCE_TYPE_1);
      const associatedBrand = app.getReference(BrandFixture.BRAND_ASTON_MARTIN);
      const createResidenceDto = {
        name: 'Ritz Carlton Miami',
        residenceTypeId: residenceType.id,
        locationId: location.id,
        websiteLink: 'https://dummywebsite.com',
        associatedBrandId: associatedBrand.id,
        briefOverview: {
          subtitle: 'Beautiful Residence',
          briefDescription: 'A luxurious residence with beautiful views.',
        },
        comprehensiveOverview: {
          subtitle: 'Luxurious Residence',
          generalDescription: 'Located in the heart of the city.',
          community: 'Upscale community.',
          recentRenovation: 'Renovated in 2022.',
          localAttractions: 'Close to parks and shopping centers.',
          futureDevelopmentPlans: 'New development projects in the vicinity.',
        },
        budgetLimitationsRange: {
          startRange: 500000,
          endRange: 1000000,
        },
      };

      // Convert the createResidenceDto to a JSON string
      const body = JSON.stringify(createResidenceDto);

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

  describe('Update Residence', () => {
    it('Should update an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);
      const updateResidenceDto = {
        name: 'Updated Residence Name',
        websiteLink: 'https://updatedwebsite.com',
        briefOverview: {
          subtitle: 'Updated Overview',
          briefDescription: 'Updated description for the residence.',
        },
        comprehensiveOverview: {
          subtitle: 'Updated Luxurious Residence',
          generalDescription: 'Updated description of the residence.',
          community: 'Updated community information.',
          recentRenovation: 'Renovated in 2023.',
          localAttractions: 'Updated attractions info.',
          futureDevelopmentPlans: 'Updated development plans.',
        },
        budgetLimitationsRange: {
          startRange: 600000,
          endRange: 1100000,
        },
      };

      // Convert the updateResidenceDto to a JSON string
      const body = JSON.stringify(updateResidenceDto);

      // Send PUT request to update the existing residence
      const res = await app.exec('PUT', `${url}/${existingResidence.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });

      expect(res.status).toBe(200);
    });
  });
});
