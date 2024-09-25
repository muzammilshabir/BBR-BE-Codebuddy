import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { ResidencesFixture } from '../residences/residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';
import { UserRole } from 'src/users/enum/user.enum';
import { BrandCategoryFixture } from 'src/brandCategory/brandCategory.fixture';

describe('ResidenceController', () => {
  const app = new TestSuiteBBR(AppModule, [
    ResidencesFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    BrandCategoryFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture,
  ]);
  const url = '/lead';

  describe('Create Lead', () => {
    it('Should create a new Lead', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);

      const createLeadDto = {
        name: 'John Doe',
        phoneNumber: '9123456789',
        residenceId: residence.Id,
        pageUrl: 'https://dummywebsite.com/lead-page',
        country: 'USA',
        source: 'website form',
      };

      // Convert the createLeadDto to a JSON string
      const body = JSON.stringify(createLeadDto);

      // Send POST request
      const res = await app.exec('POST', url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });
});
