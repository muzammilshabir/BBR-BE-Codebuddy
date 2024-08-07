// src/unit/unit.e2e.spec.ts
import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { ResidencesFixture } from '../residences/residences.fixture';
import { UnitFixture } from './unit.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

describe('UnitController', () => {
  const app = new TestSuite(AppModule, [
    ResidencesFixture,
    UnitFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    UploadFixture,
    AmenityFixture,
  ]);
  const url = '/unit';

  describe('Add Unit', () => {
    it('Should add a new Unit to a Residence', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const createUnitDto = {
        residenceId: residence._id,
        unitName: 'Unit A',
        specs: {
          unitNumber: '101',
          generalUnitSpaceSqFt: 1200,
          floor: 1,
        },
        unitPrice: 500000,
        exclusiveOffer: {
          exclusiveUnitPrice: 450000,
          OfferStartDate: '2024-08-01T00:00:00Z',
          OfferEndDate: '2024-08-31T00:00:00Z',
        },
        rooms: [
          {
            roomType: 'Bedroom',
            unit: 1,
          },
          {
            roomType: 'Bathroom',
            unit: 2,
          },
        ],
        briefOverview: {
          subTitle: 'Spacious Unit',
          description: 'A spacious unit with modern amenities.',
        },
      };

      // Convert the createUnitDto to a JSON string
      const body = JSON.stringify(createUnitDto);

      // Send POST request
      const res = await app.exec('POST', `${url}/${residence._id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });

      // Check response status and data
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Unit added successfully');
      expect(res.body.data.unit).toEqual(
        expect.objectContaining({
          unitName: 'Unit A',
          briefOverview: expect.objectContaining({
            subTitle: 'Spacious Unit',
            description: 'A spacious unit with modern amenities.',
          }),
        })
      );
    });
  });
});
