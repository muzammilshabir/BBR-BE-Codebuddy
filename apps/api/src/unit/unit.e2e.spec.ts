import { AppModule } from '../app.module';
import { TestSuite } from '@bbr/api-core/modules/testing/test.suite';
import { ResidencesFixture } from '../residences/residences.fixture';
import { UnitFixture } from './unit.fixture';
import { Recurrence, ServiceType } from './enum/unit-enum';
import { UploadFixture } from '../upload/upload.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';

describe('UnitController', () => {
  const app = new TestSuite(AppModule, [
    UnitFixture,
    ResidencesFixture,
    UploadFixture,
    ResidenceTypeFixture,
    LocationFixture,
    BrandFixture,
    ResidenceFeatureFixture,
    AmenityFixture,
  ]);
  const url = '/unit';

  describe('Add Unit', () => {
    it('Should add a new Unit to a Residence', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const createUnitDto = {
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

  describe('Add Unit Key Features', () => {
    it('Should add key features to a Unit', async () => {
      const unit = app.getReference(UnitFixture.UNIT1); // Adjust to get the unit reference

      const addUnitKeyFeaturesDto = {
        features: ['Balcony with ocean view', 'Marble walls & floor'],
        residenceServices: [
          {
            serviceType: ServiceType.COOKING,
            amount: 100,
            recurrence: Recurrence.DAILY,
          },
        ],
      };

      const body = JSON.stringify(addUnitKeyFeaturesDto);

      const res = await app.exec('PUT', `${url}/${unit._id}/key-features`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Unit key features added successfully');
      expect(res.body.data.unitKeyFeatures).toEqual(
        expect.objectContaining({
          features: expect.arrayContaining(['Balcony with ocean view', 'Marble walls & floor']),
          residenceServices: expect.arrayContaining([
            expect.objectContaining({
              serviceType: ServiceType.COOKING,
              amount: 100,
              recurrence: Recurrence.DAILY,
            }),
          ]),
        })
      );
    });
  });

  describe('Add Visuals to Unit', () => {
    it('Should update visuals of a Unit', async () => {
      const unit = app.getReference(UnitFixture.UNIT1);
      const mainGalleryPhotoId = app.getReference(UploadFixture.UPLOAD_1)._id;
      const secondGalleryPhotoId = app.getReference(UploadFixture.UPLOAD_2)._id;
      const videoTourId = app.getReference(UploadFixture.UPLOAD_1)._id;

      const addVisualsDto = {
        mainGalleryPhotos: [mainGalleryPhotoId],
        secondGalleryPhotos: [secondGalleryPhotoId],
        videoTour: videoTourId,
      };

      const body = JSON.stringify(addVisualsDto);

      const res = await app.exec('PUT', `${url}/${unit._id}/visuals`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: body,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Unit visuals updated successfully');
      expect(res.body.data.visuals).toEqual(
        expect.objectContaining({
          mainGalleryPhotos: expect.arrayContaining([mainGalleryPhotoId.toString()]),
          secondGalleryPhotos: expect.arrayContaining([secondGalleryPhotoId.toString()]),
          videoTour: videoTourId.toString(),
        })
      );
    });
  });

  describe('Get Unit by ID', () => {
    it('Should retrieve a Unit by its ID', async () => {
      const unit = app.getReference(UnitFixture.UNIT1);

      const res = await app.exec('GET', `${url}/${unit._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Unit retrieved successfully');
    });

    it('Should return 404 if Unit ID does not exist', async () => {
      const nonExistentUnitId = '64b1b5f4e05c12a1f5d8e7c2'; // Example non-existent ID

      const res = await app.exec('GET', `${url}/${nonExistentUnitId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Unit with ID ${nonExistentUnitId} not found`);
    });
  });

  describe('List Units', () => {
    it('Should list units with pagination and optional residenceId filter', async () => {
      const residence = app.getReference(ResidencesFixture.RESIDENCE1);
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&residenceId=${residence._id}`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Units retrieved successfully');
      expect(res.body.data.units).toBeDefined();
      expect(res.body.data.units.pagination).toEqual(
        expect.objectContaining({
          limit: expect.any(Number),
          currentPage: expect.any(Number),
          totalDocs: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPrevPage: expect.any(Boolean),
        })
      );
    });

    it('Should list units without residenceId filter', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Units retrieved successfully');
      expect(res.body.data.units).toBeDefined();
      expect(res.body.data.units.pagination).toEqual(
        expect.objectContaining({
          limit: expect.any(Number),
          currentPage: expect.any(Number),
          totalDocs: expect.any(Number),
          totalPages: expect.any(Number),
          hasNextPage: expect.any(Boolean),
          hasPrevPage: expect.any(Boolean),
        })
      );
    });

    it('Should handle invalid residenceId', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&residenceId=invalidId`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid ObjectId for residenceId');
    });
  });

  describe('Delete Unit', () => {
    it('Should delete a Unit by its ID', async () => {
      const unit = app.getReference(UnitFixture.UNIT1);

      const res = await app.exec('DELETE', `${url}/${unit._id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Unit Deleted successfully');
    });

    it('Should return 404 if Unit ID does not exist', async () => {
      const nonExistentUnitId = '64b1b5f4e05c12a1f5d8e7c2'; // Example non-existent ID

      const res = await app.exec('DELETE', `${url}/${nonExistentUnitId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Unit with ID ${nonExistentUnitId} not found`);
    });

    it('Should handle invalid Unit ID', async () => {
      const invalidUnitId = 'invalidId';

      const res = await app.exec('DELETE', `${url}/${invalidUnitId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(res.status).toBe(400); // Assuming your validation pipe handles invalid IDs
      expect(res.body.message).toBe('Invalid ObjectId for unitId');
    });
  });
});
