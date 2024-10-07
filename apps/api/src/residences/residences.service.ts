import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';
import {
  RejectResidenceDto,
  UpdateResidenceDto,
  UpdateResidenceStatusDto,
} from './dto/update-residence.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { AddKeyFeaturesDto } from './dto/residenceKeyFeatures.dto';
import { AddResidenceVisualsDto } from './dto/add-visuals.dto';
import { Types } from 'mongoose';
import { UpdateNearbyAmenitiesDto } from './dto/update-nearby-amenities.dto';
import {
  ListResidenceByFiltersDto,
  ListResidenceByFiltersQueryPropsDto,
  ListResidenceDto,
  ListResidenceWithDraftDto,
} from './dto/list-residence.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';
import { ResidenceStatus } from './enum/residence-enum';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { UserRole } from '../users/enum/user.enum';
import { CityRepository } from '../city/city.repository';
import { ResidenceDraftRepository } from '../residencesDraft/residencesDraft.repository';
import { ResidenceDraft } from '../residencesDraft/schema/residencesDraft.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { ResidenceTypeRepository } from '../residenceType/residenceType.repository';
import { BrandRepository } from '../brand/brand.repository';
import { UserRepository } from '../users/user.repository';
import { ResidenceFeatureRepository } from '../residenceFeatures/residenceFeatures.repository';
import { AmenityRepository } from '../amenities/amenities.repository';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';
import { UnitRepository } from '../unit/unit.repository';

@Injectable()
export class ResidenceService {
  constructor(
    private readonly residenceRepository: ResidenceRepository,
    private readonly cityRepository: CityRepository,
    private readonly residenceDraftRepository: ResidenceDraftRepository,
    private readonly unitDraftRepository: UnitDraftRepository,
    private readonly unitRepository: UnitRepository,
    private readonly residenceTypeRepository: ResidenceTypeRepository,
    private readonly brandRepository: BrandRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceFeatureRepository: ResidenceFeatureRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly lifeStyleRepository: LifeStyleRepository
  ) {}

  async create(createResidenceDto: CreateResidenceDto, user: JwtPayloadType): Promise<Residence> {
    const transformedDto: any = {
      ...createResidenceDto,
      residenceTypeId: new Types.ObjectId(createResidenceDto.residenceTypeId),
      locationId: createResidenceDto.locationId
        ? new Types.ObjectId(createResidenceDto.locationId)
        : undefined,
      associatedBrandId: createResidenceDto.associatedBrandId
        ? new Types.ObjectId(createResidenceDto.associatedBrandId)
        : undefined,
      createdById: new Types.ObjectId(user.sub),
    };

    if (user.role === UserRole.SELLER) {
      transformedDto.developerId = new Types.ObjectId(user.sub);
    }

    if (createResidenceDto.address?.city) {
      const cityName = createResidenceDto.address.city.trim();
      const cityDetails = await this.cityRepository.findByCityName(cityName);

      if (!cityDetails) {
        throw new NotFoundException(`Unsupported city ${cityName}`);
      }

      transformedDto.cityId = new Types.ObjectId(cityDetails.id);
      transformedDto.countryId = new Types.ObjectId(cityDetails.countryId);
      transformedDto.address = createResidenceDto.address;
    }

    const residence = await this.residenceRepository.create(transformedDto);

    await this.residenceDraftRepository.create({
      ...transformedDto,
      residenceId: new Types.ObjectId(residence.id),
    });

    return residence;
  }

  async updateGeneralInfo(
    id: string,
    updateResidenceDto: UpdateResidenceDto,
    user: JwtPayloadType
  ): Promise<ResidenceDraft> {
    await this.checkResidenceRejectedStatus(id);

    const transformedDto: any = {
      ...updateResidenceDto,
      residenceTypeId: updateResidenceDto.residenceTypeId
        ? new Types.ObjectId(updateResidenceDto.residenceTypeId)
        : undefined,
      locationId: updateResidenceDto.locationId
        ? new Types.ObjectId(updateResidenceDto.locationId)
        : undefined,
      associatedBrandId: updateResidenceDto.associatedBrandId
        ? new Types.ObjectId(updateResidenceDto.associatedBrandId)
        : undefined,
      updatedById: new Types.ObjectId(user.sub),
    };

    if (updateResidenceDto.address?.city) {
      const cityName = updateResidenceDto.address.city.trim();
      const cityDetails = await this.cityRepository.findByCityName(cityName);

      if (!cityDetails) {
        throw new NotFoundException(`Unsupported city ${cityName}`);
      }

      transformedDto.cityId = new Types.ObjectId(cityDetails.id);
      transformedDto.countryId = new Types.ObjectId(cityDetails.countryId);
      transformedDto.address = updateResidenceDto.address;
    }
    const residenceDraft = await this.checkResidenceDraft(id);
    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, transformedDto);
    }

    return await this.residenceDraftRepository.create({
      ...transformedDto,
      residenceId: new Types.ObjectId(id),
    });
  }

  async checkResidenceRejectedStatus(residenceId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId}`);
    }
    if (residence.status === ResidenceStatus.REJECTED) {
      throw new BadRequestException(`Rejected Residence cannot be updated`);
    }
  }

  async checkResidenceDraft(residenceId: string): Promise<ResidenceDraft | null> {
    return await this.residenceDraftRepository.find({
      residenceId: new Types.ObjectId(residenceId),
      status: { $in: [ResidenceStatus.DRAFT, ResidenceStatus.PENDING] },
    });
  }

  async addKeyFeatures(
    residenceId: string,
    addKeyFeaturesDto: AddKeyFeaturesDto,
    userId: string
  ): Promise<ResidenceDraft> {
    await this.checkResidenceRejectedStatus(residenceId);

    const transformedDto = {
      ...addKeyFeaturesDto,
      featureIds: addKeyFeaturesDto.featureIds.map((featureId) => new Types.ObjectId(featureId)),
      updatedById: new Types.ObjectId(userId),
    };

    const residenceDraft = await this.checkResidenceDraft(residenceId);

    if (residenceDraft) {
      const updatedData = await this.residenceDraftRepository.update(residenceDraft.id, {
        residenceKeyFeatures: transformedDto,
      });
      return updatedData;
    }
    const residence: Residence = await this.residenceRepository.findById(residenceId);

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      residenceKeyFeatures: transformedDto,
      residenceId: new Types.ObjectId(residenceId),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async addVisuals(
    residenceId: string,
    addVisualsDto: AddResidenceVisualsDto,
    userId: string
  ): Promise<Residence> {
    await this.checkResidenceRejectedStatus(residenceId);

    const transformedDto = {
      ...addVisualsDto,
      mainPhotos: addVisualsDto.mainGalleryPhotos
        ? addVisualsDto.mainGalleryPhotos.map((photoId) => new Types.ObjectId(photoId))
        : undefined,
      mainGalleryPhotos: addVisualsDto.mainGalleryPhotos.map(
        (photoId) => new Types.ObjectId(photoId)
      ),
      secondGalleryPhotos: addVisualsDto.secondGalleryPhotos?.map(
        (photoId) => new Types.ObjectId(photoId)
      ),
      videoTour: addVisualsDto.videoTour ? new Types.ObjectId(addVisualsDto.videoTour) : undefined,
      updatedById: new Types.ObjectId(userId),
    };

    const residenceDraft = await this.checkResidenceDraft(residenceId);

    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, {
        visuals: transformedDto,
      });
    }

    const residence: Residence = await this.residenceRepository.findById(residenceId);

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      visuals: transformedDto,
      residenceId: new Types.ObjectId(residenceId),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async updateNearbyAmenities(
    residenceId: string,
    updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto,
    userId: string
  ): Promise<Residence> {
    await this.checkResidenceRejectedStatus(residenceId);
    const transformedDto = {
      ...updateNearbyAmenitiesDto,
      amenitiesList: updateNearbyAmenitiesDto.amenitiesList.map(
        (amenityId) => new Types.ObjectId(amenityId)
      ),
      highlightedAmenities: updateNearbyAmenitiesDto.highlightedAmenities.map(
        (highlightedAmenity) => ({
          ...highlightedAmenity,
          amenityId: highlightedAmenity.amenityId
            ? new Types.ObjectId(highlightedAmenity.amenityId)
            : undefined,
          imageId: highlightedAmenity.imageId
            ? new Types.ObjectId(highlightedAmenity.imageId)
            : undefined,
        })
      ),
      updatedById: new Types.ObjectId(userId),
    };

    const residenceDraft = await this.checkResidenceDraft(residenceId);

    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, {
        nearbyAmenities: transformedDto,
      });
    }
    const residence: Residence = await this.residenceRepository.findById(residenceId);

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      nearbyAmenities: transformedDto,
      residenceId: new Types.ObjectId(residenceId),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async getResidenceById(residenceId: string): Promise<any> {
    const residenceDetails = await this.residenceRepository.findByIdInDetail(residenceId);
    return residenceDetails;
  }

  async upgradeResidence(residenceId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    residence.premium = true;
    await this.residenceRepository.update(residence.id, residence);
  }

  async approveResidence(residenceId: string, userId: string): Promise<ResidenceDraft> {
    try {
      await this.checkResidenceRejectedStatus(residenceId);

      const residenceDraftRequest = await this.checkResidenceDraft(residenceId);
      if (!residenceDraftRequest) {
        throw new BadRequestException(
          `Not found pending Residence Draft Request with residenceId ${residenceId}`
        );
      }
      const draftRequestId = residenceDraftRequest.id.toString();

      const updatedResidenceDraftRequest = await this.residenceDraftRepository.update(
        draftRequestId,
        {
          status: ResidenceStatus.ACTIVE,
          updatedById: new Types.ObjectId(userId),
        }
      );

      const plainUpdatedDrafRequest = updatedResidenceDraftRequest.toJSON();
      delete plainUpdatedDrafRequest.residenceId;
      delete plainUpdatedDrafRequest._id;

      await this.residenceRepository.update(residenceId, {
        ...plainUpdatedDrafRequest,
      });

      const draftUnits = await this.unitRepository.findAll({
        residenceId: new Types.ObjectId(residenceId),
      });

      if (draftUnits.count > 0) {
        const unitUpdatePromises = draftUnits.data.map(async (unit) => {
          const unitId = unit._id.toString();

          // Check if there's a draft for this specific unit
          const existingUnitDraft = await this.unitDraftRepository.find({
            unitId: new Types.ObjectId(unitId),
            status: { $in: [ResidenceStatus.DRAFT, ResidenceStatus.PENDING] },
          });

          if (existingUnitDraft) {
            // Update the unit draft to ACTIVE status
            const unitDraftRequest = await this.unitDraftRepository.update(existingUnitDraft.id, {
              updatedById: new Types.ObjectId(userId),
              status: ResidenceStatus.ACTIVE,
            });

            const plainUnit = unitDraftRequest.toJSON();
            delete plainUnit.unitId;
            delete plainUnit._id;

            // Update the main unit with the approved draft data
            await this.unitRepository.update(unitId, plainUnit);
          }
        });

        await Promise.all(unitUpdatePromises);
      }
      return updatedResidenceDraftRequest;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while approving the residence',
        error
      );
    }
  }

  async listResidences(listResidenceDto: ListResidenceDto) {
    const filter: any = {};
    if (listResidenceDto.status) {
      filter.status = listResidenceDto.status;
    }
    if (listResidenceDto.locationId) {
      filter.locationId = new Types.ObjectId(listResidenceDto.locationId);
    }
    if (listResidenceDto.developerId) {
      filter.developerId = new Types.ObjectId(listResidenceDto.developerId);
    }

    const options = PaginationService.prepareOptions(listResidenceDto);

    const { data, count } = await this.residenceRepository.findAll(filter, options, [
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name countryId upload' },
      { path: 'countryId', select: 'name geographicalAreasId upload' },
      { path: 'associatedBrandId', select: 'name' },
      {
        path: 'visuals.mainPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.mainGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.secondGalleryPhotos',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'visuals.videoTour',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'nearbyAmenities.amenitiesList', select: 'name', model: 'Amenity' },
      { path: 'nearbyAmenities.highlightedAmenities.amenityId', select: 'name', model: 'Amenity' },
      {
        path: 'nearbyAmenities.highlightedAmenities.imageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      { path: 'createdById', select: 'fullName email role', model: 'User' },
      { path: 'developerId', select: 'fullName email role', model: 'User' },
    ]);

    const updatedData = data.map((residence) => {
      const cleanResidence = residence.toObject();

      return {
        ...cleanResidence,
        views: 0,
        saves: 0,
        inquiries: 0,
      };
    });
    const transformedResidence = await this.transformResidences(updatedData);
    if (listResidenceDto.isDownload) {
      if (listResidenceDto.fileType === 'csv') {
        return this.generateCsv(transformedResidence);
      } else if (listResidenceDto.fileType === 'excel') {
        return this.generateExcel(transformedResidence);
      }
    }
    const { pagination } = PaginationService.paginate({ rows: data, count }, listResidenceDto);

    return { pagination, residences: transformedResidence };
  }

  transformResidences(residences: Residence[]): Residence[] {
    return residences.map((residence) => {
      const transformedResidence: any = { ...residence };

      if (residence.residenceTypeId) {
        transformedResidence.residenceType = residence.residenceTypeId;
        delete transformedResidence.residenceTypeId;
      }

      if (residence.locationId) {
        transformedResidence.location = residence.locationId;
        delete transformedResidence.locationId;
      }

      if (residence.associatedBrandId) {
        transformedResidence.associatedBrand = residence.associatedBrandId;
        delete transformedResidence.associatedBrandId;
      }

      if (residence.createdById) {
        transformedResidence.createdBy = residence.createdById;
        delete transformedResidence.createdById;
      }

      if (residence.developerId) {
        transformedResidence.developer = residence.developerId;
        delete transformedResidence.developerId;
      }

      return transformedResidence;
    });
  }

  private async generateCsv(residences: Residence[]): Promise<Buffer> {
    const csvStream = format({ headers: true });
    const bufferStream = new Writable();
    const data: Buffer[] = [];

    // Write chunks of data to a buffer array
    bufferStream._write = (chunk, encoding, next) => {
      data.push(chunk);
      next();
    };

    csvStream.pipe(bufferStream);

    // Writing each residence object to CSV
    residences.forEach((residence: any) => {
      const mainGalleryUrls = residence?.visuals?.mainGalleryPhotos
        ? residence.visuals.mainGalleryPhotos.map((photo) => photo.url).join(', ')
        : '';

      csvStream.write({
        'Residence Name': residence?.residenceType?.type || '',
        'Main Gallery Photos': mainGalleryUrls,
        'Submission Date': residence?.submissionDate || '',
        'Views': residence?.views || 0,
        'Saves': residence?.saves || 0,
        'Inquiries': residence?.inquiries || 0,
      });
    });

    csvStream.end();

    // Await the CSV generation and return the file
    const csvFile = await new Promise<Buffer>((resolve) => {
      bufferStream.on('finish', () => {
        resolve(Buffer.concat(data));
      });
    });

    return csvFile;
  }

  private async generateExcel(residences: Residence[]): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheetData = residences.map((residence: any) => {
      const mainGalleryUrls = residence?.visuals?.mainGalleryPhotos
        ? residence.visuals.mainGalleryPhotos.map((photo) => photo.url).join(', ')
        : '';

      return {
        'Residence Name': residence?.residenceType?.type || '',
        'Main Gallery Photos': mainGalleryUrls,
        'Submission Date': residence?.submissionDate || '',
        'Views': residence?.views || 0,
        'Saves': residence?.saves || 0,
        'Inquiries': residence?.inquiries || 0,
      };
    });

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Residences');

    // Write the workbook to a buffer
    const excelFileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return excelFileBuffer;
  }

  async rejectResidence(
    residenceId: string,
    userId: string,
    rejectResidenceDto: RejectResidenceDto
  ): Promise<Residence> {
    await this.checkResidenceRejectedStatus(residenceId);

    const residenceDraftRequest = await this.checkResidenceDraft(residenceId);
    if (!residenceDraftRequest) {
      throw new BadRequestException(
        `Not found pending Residence Draft Request with residenceId ${residenceId}`
      );
    }

    const updatedResidenceDraftRequest = await this.residenceDraftRepository.update(
      residenceDraftRequest.id,
      {
        status: ResidenceStatus.REJECTED,
        rejectionReason: rejectResidenceDto.rejectionReason,
        updatedById: new Types.ObjectId(userId),
      }
    );

    const residence = await this.getResidenceById(residenceId);

    if (
      residence.status === ResidenceStatus.PENDING ||
      residence.status === ResidenceStatus.DRAFT
    ) {
      await this.residenceRepository.update(residenceId, {
        status: ResidenceStatus.REJECTED,
        rejectionReason: rejectResidenceDto.rejectionReason,
        updatedById: new Types.ObjectId(userId),
      });
    }

    const draftUnits = await this.unitRepository.findAll({
      residenceId: new Types.ObjectId(residenceId),
    });

    if (draftUnits.count > 0) {
      const unitUpdatePromises = draftUnits.data.map(async (unit) => {
        const unitId = unit._id.toString();

        // Check if there's a draft for this specific unit
        const existingUnitDraft = await this.unitDraftRepository.find({
          unitId: new Types.ObjectId(unitId),
          status: ResidenceStatus.PENDING,
        });

        if (existingUnitDraft) {
          // Update the unit draft to REJECTED status
          await this.unitDraftRepository.update(existingUnitDraft.id, {
            updatedById: new Types.ObjectId(userId),
            status: ResidenceStatus.REJECTED,
          });

          // reject unit if it is in pending status
          if (unit.status === ResidenceStatus.PENDING || unit.status === ResidenceStatus.DRAFT) {
            await this.unitRepository.update(unitId, {
              updatedById: new Types.ObjectId(userId),
              status: ResidenceStatus.REJECTED,
            });
          }
        }
      });

      await Promise.all(unitUpdatePromises);
    }

    return updatedResidenceDraftRequest;
  }

  async listResidencesByFilters(
    listPropsDto: ListResidenceByFiltersQueryPropsDto,
    filtersDto: ListResidenceByFiltersDto
  ) {
    const filter: any = {};

    // TODO: Implement sorting by score.

    if (filtersDto.cities && filtersDto.cities.length > 0) {
      filter.cityId = { $in: filtersDto.cities.map((city) => new Types.ObjectId(city)) };
    }

    if (filtersDto.lifestyles && filtersDto.lifestyles.length > 0) {
      filter.lifeStyleId = {
        $in: filtersDto.lifestyles.map((lifestyles) => new Types.ObjectId(lifestyles)),
      };
    }

    if (filtersDto.status) {
      filter.status = filtersDto.status;
    }

    if (filtersDto.brands && filtersDto.brands.length > 0) {
      filter.associatedBrandId = {
        $in: filtersDto.brands.map((brand) => new Types.ObjectId(brand)),
      };
    }

    if (filtersDto.propertyTypes && filtersDto.propertyTypes.length > 0) {
      filter.residenceTypeId = {
        $in: filtersDto.propertyTypes.map((propertyType) => new Types.ObjectId(propertyType)),
      };
    }

    if (filtersDto.developerId) {
      filter.developerId = new Types.ObjectId(filtersDto.developerId);
    }

    if (listPropsDto.search) {
      filter.$or = [{ name: { $regex: listPropsDto.search, $options: 'i' } }];
    }

    const options = PaginationService.prepareOptions(listPropsDto);

    const { data, count } = await this.residenceRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listPropsDto);

    return { pagination, residences: data };
  }

  async updateResidenceToDraft(residenceId: string, existingDraftResidenceId: string) {
    await this.residenceDraftRepository.update(existingDraftResidenceId, {
      status: ResidenceStatus.DRAFT,
    });
    await this.residenceRepository.update(residenceId, { status: ResidenceStatus.DRAFT });
  }

  async createDraftForResidence(residenceId: string) {
    try {
      const residence = await this.residenceRepository.findById(residenceId);
      if (!residence) {
        throw new NotFoundException(`Residence with ID ${residenceId} not found`);
      }

      const residenceDetails = residence.toObject();
      residenceDetails.status = ResidenceStatus.DRAFT;

      delete residenceDetails._id;

      await this.residenceDraftRepository.create({
        ...residenceDetails,
        residenceId: new Types.ObjectId(residence.id),
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create residence draft', error);
    }
  }

  async updateResidenceStatus(
    residenceId: string,
    userId: string,
    updateResidenceStatusDto: UpdateResidenceStatusDto
  ): Promise<Residence> {
    const residence = await this.getResidenceById(residenceId);

    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    if (
      [ResidenceStatus.DRAFT, ResidenceStatus.REJECTED, ResidenceStatus.ACTIVE].includes(
        updateResidenceStatusDto.status
      )
    ) {
      throw new BadRequestException(
        `Cannot update residence with status: ${updateResidenceStatusDto.status}`
      );
    }
    const updatePayload: any = {
      status: updateResidenceStatusDto.status,
      updatedById: new Types.ObjectId(userId),
    };

    if (updateResidenceStatusDto.status === ResidenceStatus.DELETED) {
      updatePayload.isDeleted = DeletionStatus.DELETED;
    }

    const updatedResidence = await this.residenceRepository.update(residenceId, updatePayload);

    return updatedResidence;
  }

  async unarchiveResidence(residenceId: string, userId: string): Promise<any> {
    const residence: Residence = await this.residenceRepository.find({
      _id: new Types.ObjectId(residenceId),
      status: ResidenceStatus.ARCHIVED,
    });

    if (!residence) {
      throw new NotFoundException(
        `Residence with ID ${residenceId} with status: ${ResidenceStatus.ARCHIVED} not found`
      );
    }

    if (residence?.developerId) {
      const developer = await this.userRepository.find({
        _id: residence.developerId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!developer) {
        throw new BadRequestException(
          `Developer with ID ${residence.developerId} does not exist or is deleted`
        );
      }
    }

    if (residence?.residenceTypeId) {
      const residenceType = await this.residenceTypeRepository.find({
        _id: residence.residenceTypeId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!residenceType) {
        throw new BadRequestException(
          `ResidenceType with ID ${residence.residenceTypeId} does not exist or is deleted`
        );
      }
    }

    if (residence?.associatedBrandId) {
      const associatedBrand = await this.brandRepository.find({
        _id: residence.associatedBrandId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!associatedBrand) {
        throw new BadRequestException(
          `AssociatedBrand with ID ${residence.associatedBrandId} does not exist or is deleted`
        );
      }
    }

    if (residence?.residenceKeyFeatures?.featureIds?.length) {
      const invalidFeatures = await this.residenceFeatureRepository.count({
        _id: { $in: residence.residenceKeyFeatures.featureIds },
        isDeleted: { $ne: DeletionStatus.DELETED },
      });

      if (invalidFeatures.count !== residence.residenceKeyFeatures.featureIds.length) {
        throw new BadRequestException(`One or more residence features are invalid or deleted`);
      }
    }

    if (residence?.nearbyAmenities?.amenitiesList?.length) {
      const invalidAmenities = await this.amenityRepository.count({
        _id: { $in: residence?.nearbyAmenities?.amenitiesList },
        isDeleted: { $ne: DeletionStatus.DELETED },
      });

      if (invalidAmenities.count !== residence?.nearbyAmenities?.amenitiesList.length) {
        throw new BadRequestException(
          `One or more residence naer by amenites are invalid or deleted`
        );
      }
    }

    if (residence?.cityId) {
      const city = await this.cityRepository.find({
        _id: residence.cityId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!city) {
        throw new BadRequestException(
          `City with ID ${residence.cityId} does not exist or is deleted`
        );
      }
    }

    if (residence?.lifeStyleId) {
      const lifeStyle = await this.lifeStyleRepository.find({
        _id: residence.lifeStyleId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!lifeStyle) {
        throw new BadRequestException(
          `lifeStyle with ID ${residence.lifeStyleId} does not exist or is deleted`
        );
      }
    }

    const updatedResidence = await this.residenceRepository.update(residenceId, {
      status: ResidenceStatus.ACTIVE,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedResidence;
  }

  async listResidencesWithDraft(listResidenceWithDraftDto: ListResidenceWithDraftDto) {
    const result =
      await this.residenceRepository.listResidencesWithDraft(listResidenceWithDraftDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceWithDraftDto
    );

    return { pagination, residences: data };
  }
}
