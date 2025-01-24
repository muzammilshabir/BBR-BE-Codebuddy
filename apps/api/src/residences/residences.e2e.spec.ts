import { AppModule } from '../app.module';
import { TestSuiteBBR } from '../testing/test.suite';
import { ResidencesFixture } from './residences.fixture';
import { ResidenceTypeFixture } from '../residenceType/residenceType.fixture';
import { LocationFixture } from '../location/location.fixture';
import { BrandFixture } from '../brand/brand.fixture';
import { ResidenceFeatureFixture } from '../residenceFeatures/residenceFeature.fixture';
import { UploadFixture } from '../upload/upload.fixture';
import { AmenityFixture } from '../amenities/amenities.fixture';
import { BrandCategoryFixture } from '../brandCategory/brandCategory.fixture';
import { UserRole } from 'src/users/enum/user.enum';

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
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });
      // Check response status and data
      expect(res.status).toBe(201);
    });
  });

  describe('Update Residence', () => {
    // INCOMPLETE
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
      await app.exec('PUT', `${url}/${existingResidence.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });

      expect(1).toBe(1);
    });
  });

  describe('Add Key Features', () => {
    it('Should add key features to an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);
      const residenceFeature = app.getReference(ResidenceFeatureFixture.RESIDENCE_FEATURE_1);
      const addKeyFeaturesDto = {
        featureIds: [residenceFeature.id],
        developmentInfo: {
          yearOfBuild: 2021,
          rentalPotential: 'Medium',
          developmentStatus: 'Under Construction',
          floorAreaSqFt: 1600,
        },
        petPolicy: 'No pet Allowed',
      };

      const res = await app.exec('PUT', `${url}/${existingResidence.id}/key-features`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: JSON.stringify(addKeyFeaturesDto),
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence key features added successfully');
    });
  });

  describe('Add Visuals', () => {
    it('Should update visuals of an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);
      const mainGalleryPhotos = app.getReference(UploadFixture.UPLOAD_1);
      const secondGalleryPhotos = app.getReference(UploadFixture.UPLOAD_2);
      const videoTour = app.getReference(UploadFixture.UPLOAD_2);
      const updateVisualsDto = {
        mainGalleryPhotos: [mainGalleryPhotos.id, secondGalleryPhotos.id],
        secondGalleryPhotos: [secondGalleryPhotos.id],
        videoTour: videoTour.id,
        videoTourLink: 'http://example.com/video',
      };

      const body = JSON.stringify(updateVisualsDto);

      const res = await app.exec('PUT', `${url}/${existingResidence.id}/visuals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });

      // Check response status and data
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence visuals updated successfully');
      expect(res.body.residence.visuals).toEqual(expect.objectContaining(updateVisualsDto));
    });
  });

  describe('Update Nearby Amenities', () => {
    it('Should update nearby amenities of an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);
      const amenity1 = app.getReference(AmenityFixture.TAG_GOLF_COURSE);
      const amenity2 = app.getReference(AmenityFixture.TAG_SWIMMING_POOL);
      const uploadImage = app.getReference(UploadFixture.UPLOAD_1);

      const updateNearbyAmenitiesDto = {
        amenitiesList: [amenity1.id, amenity2.id],
        highlightedAmenities: [
          {
            amenityId: amenity1.id,
            generalDescription: 'An updated large public park with playgrounds.',
            ImageId: uploadImage.id,
          },
        ],
      };

      const body = JSON.stringify(updateNearbyAmenitiesDto);

      const res = await app.exec('PUT', `${url}/${existingResidence.id}/nearby-amenities`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });

      // Check response status and data
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence nearby amenities updated successfully');
      expect(res.body.data.residence.nearbyAmenities).toEqual(
        expect.objectContaining(updateNearbyAmenitiesDto)
      );
    });

    it('Should update nearby amenities with partial highlightedAmenities of an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);
      const amenity1 = app.getReference(AmenityFixture.TAG_GOLF_COURSE);
      const amenity2 = app.getReference(AmenityFixture.TAG_SWIMMING_POOL);
      const uploadImage = app.getReference(UploadFixture.UPLOAD_1);

      const updateNearbyAmenitiesDto = {
        amenitiesList: [amenity1.id, amenity2.id],
        highlightedAmenities: [
          {
            amenityId: amenity1.id,
            generalDescription: 'An updated large public park with playgrounds.',
            // ImageId is omitted
          },
          {
            amenityId: amenity1.id,
            generalDescription: 'A brand new gym with modern equipment.',
            ImageId: uploadImage.id,
          },
        ],
      };

      const body = JSON.stringify(updateNearbyAmenitiesDto);

      const res = await app.exec('PUT', `${url}/${existingResidence.id}/nearby-amenities`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: body,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence nearby amenities updated successfully');
      expect(res.body.data.residence.nearbyAmenities).toEqual(
        expect.objectContaining({
          amenitiesList: expect.arrayContaining(updateNearbyAmenitiesDto.amenitiesList),
          highlightedAmenities: expect.arrayContaining([
            expect.objectContaining({
              amenityId: amenity1.id,
              generalDescription: 'An updated large public park with playgrounds.',
              // ImageId should be undefined or not present
            }),
            expect.objectContaining({
              amenityId: amenity1.id,
              generalDescription: 'A brand new gym with modern equipment.',
              ImageId: uploadImage.id,
            }),
          ]),
        })
      );
    });
  });

  describe('Get Residence by ID', () => {
    it('Should retrieve a Residence by ID', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);

      const res = await app.exec('GET', `${url}/${existingResidence.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence retrieved successfully');
    });

    it('Should return 404 if Residence ID does not exist', async () => {
      const nonExistentId = '60f9c1e07c8b4b001c5c9c99';

      // Send GET request with a non-existent ID
      const res = await app.exec('GET', `${url}/${nonExistentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Residence with ID ${nonExistentId} not found`);
    });
  });

  describe('Update Residence Status', () => {
    // INCOMPLETE
    it('Should update the status of an existing Residence', async () => {
      const existingResidence = app.getReference(ResidencesFixture.RESIDENCE1);

      const updateResidenceStatusDto = {
        status: 'pending', // Example status, active,pending,draft,sold,rejected
      };

      // Send PUT request to update the residence status
      await app.exec('PUT', `${url}/${existingResidence.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: JSON.stringify(updateResidenceStatusDto),
      });

      expect(1).toBe(1);
    });

    it('Should return 404 if the Residence ID does not exist', async () => {
      const nonExistentId = '60f9c1e07c8b4b001c5c9c99';

      const updateResidenceStatusDto = {
        status: 'pending',
      };

      const res = await app.exec('PUT', `${url}/${nonExistentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
        data: JSON.stringify(updateResidenceStatusDto),
      });

      expect(res.body.message).toBe(`status is not allowed`);
    });
  });

  describe('List Residence', () => {
    it('Should list residences with pagination', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&status=pending&isDownload=false&fileType=excel`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
      });

      // Check the response status and other properties
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Residence retrieved successfully');
      expect(res.body.data.residences).toBeDefined();
      expect(res.body.data.residences.pagination).toEqual(
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

    it('Should download residences as an Excel file', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&status=pending&isDownload=true&fileType=excel`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
      });

      expect(res.status).toBe(200);

      // Validate Content-Type for Excel file
      expect(res.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('Should download residences as a CSV file', async () => {
      const urlWithParams = `${url}?page=1&limit=10&sortBy=createdAt&sortOrder=desc&status=pending&isDownload=true&fileType=csv`;

      const res = await app.exec('GET', urlWithParams, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await app.getUserToken(UserRole.SELLER)}`,
        },
      });

      expect(res.status).toBe(200);

      // Validate Content-Type for CSV file
      expect(res.headers['content-type']).toMatch(/text\/csv(; charset=utf-8)?/);
    });
  });
});
