import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';
import {
  RejectResidenceDto,
  UpdateFeaturedDto,
  UpdateResidenceDto,
  UpdateResidenceStatusDto,
} from './dto/update-residence.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@bbr/api-core/modules/exceptions';
import { AddKeyFeaturesDto } from './dto/residenceKeyFeatures.dto';
import { AddResidenceVisualsDto } from './dto/add-visuals.dto';
import { Model, Types } from 'mongoose';
import { UpdateNearbyAmenitiesDto } from './dto/update-nearby-amenities.dto';
import {
  ListResidenceByFiltersDto,
  ListResidenceByFiltersQueryPropsDto,
  ListResidenceDto,
  ListResidenceWithDraftCountDto,
  ListResidenceWithDraftDto,
  ListTopResidencesDto,
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
import { GetSimilarResidenceDto } from './dto/get-similar-residence';
import { Country } from '../country/schema/country.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RankingCategoryStatus } from 'src/rankingCategory/enum/rankingCategory-status.enum';
import { RankingRequest } from 'src/rankingRequest/schema/rankingRequest.schema';
import { RankingRequestRepository } from 'src/rankingRequest/rankingRequest.repository';
import { PassThrough } from 'stream';
import * as fastcsv from 'fast-csv';
import { v4 as uuidv4 } from 'uuid';
import { PatchResidenceDto } from './dto/patch-update-residence.dto';

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
    private readonly lifeStyleRepository: LifeStyleRepository,
    private readonly rankingRequestRepository: RankingRequestRepository,
    @InjectModel(Country.name)
    private readonly countryModel: Model<Country>
  ) {}

  async create(createResidenceDto: CreateResidenceDto, user: JwtPayloadType): Promise<any> {
    const transformedDto: any = {
      ...createResidenceDto,
      residenceTypeIds: createResidenceDto.residenceTypeIds
        ? createResidenceDto.residenceTypeIds.map((typeId) => new Types.ObjectId(typeId))
        : undefined,
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
    if (user.role === UserRole.ADMIN) {
      const key = uuidv4();
      transformedDto.key = key;
      transformedDto.uniqueUrl = `${process.env.FRONTEND_BASE_URL}?key=${key}`;
    }

    if (createResidenceDto.address?.city) {
      const cityName = createResidenceDto.address.city.trim();
      const cityDetails = await this.cityRepository.findByCityName(cityName);

      if (!cityDetails) {
        throw new NotFoundException(`Unsupported city ${cityName}`);
      }

      transformedDto.cityId = new Types.ObjectId(cityDetails.id);
      transformedDto.countryId = new Types.ObjectId(cityDetails.countryId);
      transformedDto.stateId = new Types.ObjectId(cityDetails.stateId);
      transformedDto.address = createResidenceDto.address;
    }

    const residence = await this.residenceRepository.create(transformedDto);

    const residenceDraft = await this.residenceDraftRepository.create({
      ...transformedDto,
      residenceId: new Types.ObjectId(residence.id),
    });

    const residenceData = residence.toObject();
    return { ...residenceData, residenceDraftId: residenceDraft._id };
  }

  async updateGeneralInfo(
    id: string,
    updateResidenceDto: UpdateResidenceDto,
    user: JwtPayloadType
  ): Promise<ResidenceDraft> {
    try {
      await this.checkResidenceRejectedStatus(id);

      if (updateResidenceDto?.status && user.role !== UserRole.ADMIN) {
        delete updateResidenceDto.status;
      }

      const transformedDto: any = {
        ...updateResidenceDto,
        residenceTypeIds: updateResidenceDto.residenceTypeIds
          ? updateResidenceDto.residenceTypeIds.map((typeId) => new Types.ObjectId(typeId))
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
        transformedDto.stateId = new Types.ObjectId(cityDetails.stateId);
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
    } catch (error) {
      console.log(error);
      throw error;
    }
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

  async getAllResidences(options: any): Promise<any> {
    const residences = await this.residenceRepository.findAll(
      { planId: { $exists: true, $ne: null } },
      options
    );
    return residences;
  }

  async getResidencesByPlanId(planId: string, options: any): Promise<any> {
    const residences = await this.residenceRepository.findAll({ planId }, options);
    return residences;
  }

  async getResidencesByAssociatedBrandId(associatedBrandId: string, options: any): Promise<any> {
    const residences = await this.residenceRepository.findAll(
      { associatedBrandId: new Types.ObjectId(associatedBrandId) },
      options
    );
    return residences;
  }

  async upgradeResidence(residenceId: string, subscriptionId: string, planId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    return this.residenceRepository.update(residence.id, {
      subscriptionId: new Types.ObjectId(subscriptionId),
      planId: new Types.ObjectId(planId),
    });
  }

  async getResidencesByPaymentMethodId(paymentMethodId: string): Promise<any> {
    return (await this.residenceRepository.findAll({ paymentMethodId })).data;
  }

  async addDefaultPaymentMethod(residenceId: string, paymentMethodId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    return this.residenceRepository.update(residence.id, {
      paymentMethodId,
    });
  }

  async removeDefaultPaymentMethod(residenceId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    return this.residenceRepository.update(residence.id, {
      paymentMethodId: '',
    });
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
    const filter: any = {
      isDeleted: { $ne: DeletionStatus.DELETED },
    };
    if (listResidenceDto.status) {
      filter.status = listResidenceDto.status;
    }
    if (listResidenceDto.locationId) {
      filter.locationId = new Types.ObjectId(listResidenceDto.locationId);
    }
    if (listResidenceDto.developerId) {
      filter.developerId = new Types.ObjectId(listResidenceDto.developerId);
    }
    if (listResidenceDto.featured) {
      filter.featured = listResidenceDto.featured;
    }
    if (listResidenceDto.search) {
      filter.name = { $regex: listResidenceDto.search, $options: 'i' };
    }
    const options = PaginationService.prepareOptions(listResidenceDto);

    const { data, count } = await this.residenceRepository.findAll(filter, options, [
      {
        path: 'residenceTypeIds',
        select: 'type',
        model: 'ResidenceType',
      },
      { path: 'cityId', select: 'name countryId upload' },
      { path: 'countryId', select: 'name geographicalAreasId upload' },
      { path: 'stateId', select: 'name stateCode upload' },
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
      { path: 'highestRankingCategoryId', model: 'RankingCategory', select: 'title' },
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
    const pipeline: any[] = [];

    // Match filters
    const matchStage: any = {
      isDeleted: false,
      status: 'active',
    };

    if (filtersDto.cities && filtersDto.cities.length > 0) {
      matchStage.cityId = { $in: filtersDto.cities.map((city) => new Types.ObjectId(city)) };
    }

    if (filtersDto.countryId) {
      const countryIds = Array.isArray(filtersDto.countryId)
        ? filtersDto.countryId
        : [filtersDto.countryId];
      matchStage.countryId = { $in: countryIds.map((id) => new Types.ObjectId(id)) };
    }

    if (filtersDto.stateId) {
      // Handle both string and array cases
      const stateIds = Array.isArray(filtersDto.stateId)
        ? filtersDto.stateId
        : [filtersDto.stateId];

      matchStage.stateId = {
        $in: stateIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filtersDto.geographicalAreasId && filtersDto.geographicalAreasId.length > 0) {
      const countriesInAreas = await this.countryModel
        .find({
          geographicalAreasId: {
            $in: filtersDto.geographicalAreasId.map((id) => new Types.ObjectId(id)),
          },
        })
        .select('_id');

      matchStage.countryId = {
        $in: countriesInAreas.map((country) => country._id),
      };
    }

    if (filtersDto.lifestyles && filtersDto.lifestyles.length > 0) {
      matchStage.lifeStyleId = {
        $in: filtersDto.lifestyles.map((lifestyle) => new Types.ObjectId(lifestyle)),
      };
    }

    if (filtersDto.status) {
      matchStage.status = filtersDto.status;
    }

    if (filtersDto.brands && filtersDto.brands.length > 0) {
      matchStage.associatedBrandId = {
        $in: filtersDto.brands.map((brand) => new Types.ObjectId(brand)),
      };
    }

    if (filtersDto.propertyTypes && filtersDto.propertyTypes.length > 0) {
      matchStage.residenceTypeIds = {
        $in: filtersDto.propertyTypes.map((propertyType) => new Types.ObjectId(propertyType)),
      };
    }

    if (filtersDto.petPolicy && filtersDto.petPolicy.length > 0) {
      matchStage['residenceKeyFeatures.petPolicy'] = {
        $in: filtersDto.petPolicy.map((policy) => new RegExp(policy, 'i')),
      };
    }

    if (filtersDto.floorAreaSqFt && filtersDto.floorAreaSqFt.length > 0) {
      const maxFloorArea = Math.max(...filtersDto.floorAreaSqFt);
      matchStage['residenceKeyFeatures.developmentInfo.floorAreaSqFt'] = {
        $lte: maxFloorArea,
      };
    }

    if (filtersDto.featureIds && filtersDto.featureIds.length > 0) {
      matchStage['residenceKeyFeatures.featureIds'] = {
        $all: filtersDto.featureIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filtersDto.yearOfBuild && filtersDto.yearOfBuild.length > 0) {
      const maxYear = Math.max(...filtersDto.yearOfBuild);
      matchStage['residenceKeyFeatures.developmentInfo.yearOfBuild'] = {
        $lte: maxYear,
      };
    }

    if (filtersDto.developerId) {
      matchStage.developerId = new Types.ObjectId(filtersDto.developerId);
    }

    if (listPropsDto.search) {
      matchStage.$or = [{ name: { $regex: listPropsDto.search, $options: 'i' } }];
    }

    if (filtersDto.locationIds && filtersDto.locationIds.length > 0) {
      matchStage.locationId = {
        $in: filtersDto.locationIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filtersDto.developmentStatus && filtersDto.developmentStatus.length > 0) {
      matchStage['residenceKeyFeatures.developmentInfo.developmentStatus'] = {
        $in: filtersDto.developmentStatus.map((status) => new RegExp(status, 'i')),
      };
    }

    if (filtersDto.rentalPotential && filtersDto.rentalPotential.length > 0) {
      matchStage['residenceKeyFeatures.developmentInfo.rentalPotential'] = {
        $in: filtersDto.rentalPotential.map((potential) => new RegExp(potential, 'i')),
      };
    }

    if (filtersDto.amenitiesList && filtersDto.amenitiesList.length > 0) {
      matchStage['nearbyAmenities.amenitiesList'] = {
        $all: filtersDto.amenitiesList.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filtersDto.priceRange && filtersDto.priceRange.length > 0) {
      // Create pipeline stages for type conversion
      pipeline.unshift({
        $addFields: {
          startRangeNum: { $toDouble: '$budgetLimitationsRange.startRange' },
          endRangeNum: { $toDouble: '$budgetLimitationsRange.endRange' },
        },
      });

      // Calculate min start range and max end range from all provided ranges
      const minStartRange = Math.min(
        ...filtersDto.priceRange.map((range) => Number(range.startRange))
      );
      const maxEndRange = Math.max(...filtersDto.priceRange.map((range) => Number(range.endRange)));

      // Create the match stage with single range check
      matchStage.$and = [
        { startRangeNum: { $exists: true } },
        { endRangeNum: { $exists: true } },
        { startRangeNum: { $gte: minStartRange } },
        { endRangeNum: { $lte: maxEndRange } },
      ];
    }

    if (filtersDto.roomCountRange && filtersDto.roomCountRange.length > 0) {
      // Calculate min and max room counts from all provided ranges
      const minRooms = Math.min(...filtersDto.roomCountRange.map((range) => range.minRooms));
      const maxRooms = Math.max(...filtersDto.roomCountRange.map((range) => range.maxRooms));

      // Add lookup before main match stage
      pipeline.unshift(
        {
          $match: {
            isDeleted: false,
            status: 'active',
          },
        },
        {
          $lookup: {
            from: 'units',
            let: { residenceId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$residenceId', '$$residenceId'] },
                  isDeleted: { $ne: true },
                  status: 'active',
                },
              },
              {
                $unwind: {
                  path: '$rooms',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: 'roomtypes',
                  let: { roomTypeId: '$rooms.roomTypeId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$roomTypeId'] },
                        type: 'Bedroom',
                        isDeleted: { $ne: true },
                      },
                    },
                  ],
                  as: 'roomType',
                },
              },
              {
                $match: {
                  'roomType.0': { $exists: true },
                },
              },
              {
                $group: {
                  _id: '$residenceId',
                  totalBedrooms: { $sum: '$rooms.unit' },
                },
              },
              {
                $match: {
                  totalBedrooms: {
                    $gte: minRooms,
                    $lte: maxRooms,
                  },
                },
              },
            ],
            as: 'matchingUnits',
          },
        },
        {
          $match: {
            'matchingUnits.0': { $exists: true },
          },
        }
      );
    }

    pipeline.push({ $match: matchStage });

    // Add lookups and projections as needed
    pipeline.push(
      {
        $lookup: {
          from: 'residencetypes',
          localField: 'residenceTypeIds',
          foreignField: '_id',
          as: 'residenceTypes',
        },
      },
      {
        $lookup: {
          from: 'cities',
          localField: 'cityId',
          foreignField: '_id',
          as: 'city',
        },
      },
      {
        $lookup: {
          from: 'states',
          localField: 'stateId',
          foreignField: '_id',
          as: 'state',
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'associatedBrandId',
          foreignField: '_id',
          as: 'associatedBrand',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          let: {
            mainPhotos: '$visuals.mainPhotos',
            mainGalleryPhotos: '$visuals.mainGalleryPhotos',
            secondGalleryPhotos: '$visuals.secondGalleryPhotos',
            videoTour: '$visuals.videoTour',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    '$_id',
                    {
                      $concatArrays: [
                        { $ifNull: ['$$mainPhotos', []] },
                        { $ifNull: ['$$mainGalleryPhotos', []] },
                        { $ifNull: ['$$secondGalleryPhotos', []] },
                        { $ifNull: [['$$videoTour'], []] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                originalFileKey: 1,
                fileKey: 1,
                url: 1,
                mimeType: 1,
              },
            },
          ],
          as: 'uploadedFiles',
        },
      },
      {
        $addFields: {
          visuals: {
            mainPhotos: {
              $filter: {
                input: '$uploadedFiles',
                as: 'file',
                cond: { $in: ['$$file._id', { $ifNull: ['$visuals.mainPhotos', []] }] },
              },
            },
            mainGalleryPhotos: {
              $filter: {
                input: '$uploadedFiles',
                as: 'file',
                cond: { $in: ['$$file._id', { $ifNull: ['$visuals.mainGalleryPhotos', []] }] },
              },
            },
            secondGalleryPhotos: {
              $filter: {
                input: '$uploadedFiles',
                as: 'file',
                cond: { $in: ['$$file._id', { $ifNull: ['$visuals.secondGalleryPhotos', []] }] },
              },
            },
            videoTour: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$uploadedFiles',
                    as: 'file',
                    cond: { $eq: ['$$file._id', '$visuals.videoTour'] },
                  },
                },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          uploadedFiles: 0,
        },
      },
      {
        $lookup: {
          from: 'amenities',
          localField: 'nearbyAmenities.amenitiesList',
          foreignField: '_id',
          as: 'amenitiesData',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          localField: 'nearbyAmenities.highlightedAmenities.imageId',
          foreignField: '_id',
          as: 'highlightedAmenitiesImages',
        },
      },
      {
        $addFields: {
          'nearbyAmenities': {
            amenitiesList: '$amenitiesData',
            highlightedAmenities: {
              $map: {
                input: '$nearbyAmenities.highlightedAmenities',
                as: 'highlighted',
                in: {
                  amenityId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$amenitiesData',
                          as: 'amenity',
                          cond: { $eq: ['$$amenity._id', '$$highlighted.amenityId'] },
                        },
                      },
                      0,
                    ],
                  },
                  imageId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$highlightedAmenitiesImages',
                          as: 'image',
                          cond: { $eq: ['$$image._id', '$$highlighted.imageId'] },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          amenitiesData: 0,
          highlightedAmenitiesImages: 0,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdById',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'developerId',
          foreignField: '_id',
          as: 'developer',
        },
      },
      {
        $lookup: {
          from: 'rankingcategories',
          localField: 'highestRankingCategoryId',
          foreignField: '_id',
          as: 'highestRankingCategory',
        },
      },
      {
        $lookup: {
          from: 'rankingrequests',
          let: { residenceId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$residenceId', '$$residenceId'] },
                status: 'active',
                isDeleted: { $ne: true },
                bbrScore: { $exists: true }
              }
            },
            {
              $lookup: {
                from: 'rankingcategories',
                localField: 'rankingCategoryId',
                foreignField: '_id',
                as: 'rankingCategory'
              }
            },
            {
              $unwind: {
                path: '$rankingCategory',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $addFields: {
                rankingCategoryId: '$rankingCategory'
              },
            },
          ],
          as: 'rankings'
        }
      },
      {
        $addFields: {
          bbrScore: {
            $ifNull: [
              { $arrayElemAt: ['$rankings.bbrScore', 0] },
              null
            ]
          }
        }
      },
      {
        $project: {
          rankings: 0
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          residenceTypes: 1,
          city: 1,
          state: 1,
          country: 1,
          associatedBrand: 1,
          mainPhotos: 1,
          mainGalleryPhotos: 1,
          secondGalleryPhotos: 1,
          videoTour: 1,
          amenitiesList: 1,
          highlightedAmenities: 1,
          highlightedAmenitiesImage: 1,
          createdBy: 1,
          developer: 1,
          highestRankingCategory: 1,
          status: 1,
          budgetLimitationsRange: 1,
          residenceKeyFeatures: 1,
          visuals: 1,
          nearbyAmenities: 1,
          createdAt: 1,
          updatedAt: 1,
          bbrScore: 1,
        },
      }
    );

    // Pagination
    const options = PaginationService.prepareOptions(listPropsDto);
    pipeline.push(
      {
        $facet: {
          data: [{ $skip: Number(options.offset) }, { $limit: Number(options.limit) }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      }
    );

    const result = await this.residenceRepository.aggregate(pipeline);
    const { data, totalCount } = result[0];

    const pagination = PaginationService.paginate({ rows: data, count: totalCount }, listPropsDto);

    const updatedData = [];
    const rankingMap: Map<string, RankingRequest[]> = new Map();

    for (let index = 0; index < data.length; index++) {
      const residence = data[index];
      const residenceWithRankings = { 
        ...residence,
        rankings: []
      };
      
      if (residence.rankings && residence.rankings.length > 0) {
        const updatedRankings = await Promise.all(
          residence.rankings.map(async (ranking) => {
            const rankingCategoryId = ranking.rankingCategory._id.toString();
            
            // Get or fetch rankings for this category
            let categoryRankings = rankingMap.get(rankingCategoryId);
            if (!categoryRankings) {
              const { data: newRankings } = await this.rankingRequestRepository.findAll(
                {
                  rankingCategoryId: new Types.ObjectId(rankingCategoryId),
                  isDeleted: { $ne: DeletionStatus.DELETED },
                  bbrScore: { $exists: true },
                  status: {
                    $in: [
                      RankingCategoryStatus.ACTIVE,
                      RankingCategoryStatus.DRAFT,
                      RankingCategoryStatus.PENDING,
                    ],
                  },
                },
                {
                  sort: { bbrScore: -1 },
                }
              );
              categoryRankings = newRankings;
              rankingMap.set(rankingCategoryId, newRankings);
            }

            // Calculate position (1-based index)
            const position = categoryRankings.findIndex(
              (r) => r._id.toString() === ranking._id.toString()
            );

            return {
              ...ranking,
              position,
            };
          })
        );

        residenceWithRankings.rankings = updatedRankings;
      }
      
      updatedData.push(residenceWithRankings);
    }

    return { 
      pagination, 
      residences: updatedData.map(residence => ({
        ...residence,
        rankings: residence.rankings || []
      })) 
    };
  }

  private async getCurrentPosition(
    rankingRequests: RankingRequest[],
    residenceId: string
  ): Promise<number> {
    const index = rankingRequests.findIndex(
      (request) => request.residenceId.toString() === residenceId
    );

    return index !== -1 ? index : -1;
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

    if (residence?.residenceTypeIds?.length) {
      const validResidenceTypes = await this.residenceTypeRepository.count({
        _id: { $in: residence.residenceTypeIds },
        isDeleted: { $ne: DeletionStatus.DELETED },
      });

      if (validResidenceTypes.count !== residence.residenceTypeIds.length) {
        throw new BadRequestException(
          `One or more ResidenceTypes in residenceTypeIds are invalid or deleted`
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
        active: true,
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

    const updatedData = data.map((item) => ({
      ...item,
      city: {
        name: item.city[0]?.name[0] || null, // Extracts the first element from name array, or null if not present
        countryId: item.city[0]?.countryId[0] || null, // Extracts the first element from countryId array, or null if not present
      },
      country: {
        name: item.country[0]?.name[0] || null, // Extracts the first element from name array, or null if not present
      },
      state: {
        name: item.state[0]?.name[0] || null,
      },
      associatedBrand: item.associatedBrand[0] || null,
    }));

    const { pagination } = PaginationService.paginate(
      { rows: updatedData, count },
      listResidenceWithDraftDto
    );

    return { pagination, residences: updatedData };
  }

  async getSimilarResidences(getSimilarResidenceDto: GetSimilarResidenceDto) {
    const result = await this.residenceRepository.getSimilarResidences(getSimilarResidenceDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      getSimilarResidenceDto
    );

    return { pagination, residences: data };
  }

  async getTopResidences(listTopResidencesDto: ListTopResidencesDto) {
    const filter: any = {
      isDeleted: { $ne: DeletionStatus.DELETED },
      status: ResidenceStatus.ACTIVE,
      highestBbrScore: { $exists: true },
      ...(listTopResidencesDto.countryId
        ? { countryId: new Types.ObjectId(listTopResidencesDto.countryId) }
        : {}),
    };
    const options = PaginationService.prepareOptions(listTopResidencesDto);

    const { data, count } = await this.residenceRepository.findAll(filter, options, [
      {
        path: 'residenceTypeIds',
        select: 'type',
        model: 'ResidenceType',
      },
      { path: 'cityId', select: 'name countryId upload' },
      { path: 'countryId', select: 'name geographicalAreasId upload' },
      { path: 'stateId', select: 'name stateCode upload' },
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
      { path: 'highestRankingCategoryId', model: 'RankingCategory', select: 'title' },
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

    const { pagination } = PaginationService.paginate({ rows: data, count }, listTopResidencesDto);

    const response = [];

    for (let index = 0; index < transformedResidence.length; index++) {
      const residence = transformedResidence[index];
      const newRankingRequests = await this.rankingRequestRepository.findAll(
        {
          rankingCategoryId: new Types.ObjectId(
            residence?.highestRankingCategoryId?.['_id'].toString()
          ),
          isDeleted: { $ne: DeletionStatus.DELETED },
          bbrScore: { $exists: true },
          status: {
            $in: [
              RankingCategoryStatus.ACTIVE,
              RankingCategoryStatus.DRAFT,
              RankingCategoryStatus.PENDING,
            ],
          },
        },
        {
          sort: {
            'bbrScore': -1,
          },
        }
      );
      const position = await this.getCurrentPosition(
        newRankingRequests.data,
        residence?._id.toString()
      );
      response.push({
        ...residence,
        position,
      });
    }
    return { pagination, residences: response };
  }

  async getResidencesTotalCount(query: ListResidenceWithDraftCountDto) {
    // Call repository for each status type and aggregate the counts
    const activeCount = await this.residenceRepository.getResidencesTotalCount(
      ResidenceStatus.ACTIVE,
      query
    );
    const draftCount = await this.residenceRepository.getResidencesTotalCount(
      ResidenceStatus.DRAFT,
      query
    );
    const pendingCount = await this.residenceRepository.getResidencesTotalCount(
      ResidenceStatus.PENDING,
      query
    );
    const archivedCount = await this.residenceRepository.getResidencesTotalCount(
      ResidenceStatus.ARCHIVED,
      query
    );

    // Return a consolidated response with counts for each status
    return {
      active: activeCount[0]?.totalCount || 0,
      draft: draftCount[0]?.totalCount || 0,
      pending: pendingCount[0]?.totalCount || 0,
      archived: archivedCount[0]?.totalCount || 0,
    };
  }

  async updateFeaturedStatus(updateFeaturedDto: UpdateFeaturedDto) {
    return await this.residenceRepository.updateFeaturedStatus(updateFeaturedDto);
  }

  async listResidencesByDeveloperId(developerId: string) {
    console.log(developerId);
    return this.residenceRepository.findAllByFilter({
      createdById: new Types.ObjectId(developerId),
    });
  }

  async getResidenceByKey(key: string): Promise<any> {
    if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
      throw new ForbiddenException('Welcome Flow Disabled');
    }

    const residenceDetails = await this.residenceRepository.findByKeyInDetail(key);
    const residenceDraftDetails = await this.residenceDraftRepository.findByKeyInDetail(key);

    return { residence: residenceDetails, residenceDraft: residenceDraftDetails };
  }

  async updateGeneralInfoByKey(
    key: string,
    updateResidenceDto: UpdateResidenceDto
  ): Promise<ResidenceDraft> {
    try {
      if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
        throw new ForbiddenException('Welcome Flow Disabled');
      }

      const foundResidence = await this.residenceRepository.find({ key });

      if (!foundResidence) {
        throw new NotFoundException(`Residence with Key ${key} not found`);
      }

      await this.checkResidenceRejectedStatus(foundResidence._id.toString());

      const transformedDto: any = {
        ...updateResidenceDto,
        residenceTypeIds: updateResidenceDto.residenceTypeIds
          ? updateResidenceDto.residenceTypeIds.map((typeId) => new Types.ObjectId(typeId))
          : undefined,
        locationId: updateResidenceDto.locationId
          ? new Types.ObjectId(updateResidenceDto.locationId)
          : undefined,
        associatedBrandId: updateResidenceDto.associatedBrandId
          ? new Types.ObjectId(updateResidenceDto.associatedBrandId)
          : undefined,
      };

      if (updateResidenceDto.address?.city) {
        const cityName = updateResidenceDto.address.city.trim();
        const cityDetails = await this.cityRepository.findByCityName(cityName);

        if (!cityDetails) {
          throw new NotFoundException(`Unsupported city ${cityName}`);
        }

        transformedDto.cityId = new Types.ObjectId(cityDetails.id);
        transformedDto.countryId = new Types.ObjectId(cityDetails.countryId);
        transformedDto.stateId = new Types.ObjectId(cityDetails.stateId);
        transformedDto.address = updateResidenceDto.address;
      }
      const residenceDraft = await this.checkResidenceDraft(foundResidence._id.toString());
      if (residenceDraft) {
        return await this.residenceDraftRepository.update(residenceDraft.id, transformedDto);
      }

      return await this.residenceDraftRepository.create({
        ...transformedDto,
        residenceId: new Types.ObjectId(foundResidence._id.toString()),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addKeyFeaturesByKey(
    key: string,
    addKeyFeaturesDto: AddKeyFeaturesDto
  ): Promise<ResidenceDraft> {
    if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
      throw new ForbiddenException('Welcome Flow Disabled');
    }

    const foundResidence = await this.residenceRepository.find({ key });

    if (!foundResidence) {
      throw new NotFoundException(`Residence with Key ${key} not found`);
    }

    await this.checkResidenceRejectedStatus(foundResidence._id.toString());

    const transformedDto = {
      ...addKeyFeaturesDto,
      featureIds: addKeyFeaturesDto.featureIds.map((featureId) => new Types.ObjectId(featureId)),
    };

    const residenceDraft = await this.checkResidenceDraft(foundResidence._id.toString());

    if (residenceDraft) {
      const updatedData = await this.residenceDraftRepository.update(residenceDraft.id, {
        residenceKeyFeatures: transformedDto,
      });
      return updatedData;
    }
    const residence: Residence = await this.residenceRepository.findById(
      foundResidence._id.toString()
    );

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      residenceKeyFeatures: transformedDto,
      residenceId: new Types.ObjectId(foundResidence._id.toString()),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async addVisualsByKey(key: string, addVisualsDto: AddResidenceVisualsDto): Promise<Residence> {
    if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
      throw new ForbiddenException('Welcome Flow Disabled');
    }

    const foundResidence = await this.residenceRepository.find({ key });

    if (!foundResidence) {
      throw new NotFoundException(`Residence with Key ${key} not found`);
    }

    await this.checkResidenceRejectedStatus(foundResidence._id.toString());

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
    };

    const residenceDraft = await this.checkResidenceDraft(foundResidence._id.toString());

    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, {
        visuals: transformedDto,
      });
    }

    const residence: Residence = await this.residenceRepository.findById(
      foundResidence._id.toString()
    );

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      visuals: transformedDto,
      residenceId: new Types.ObjectId(foundResidence._id.toString()),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async updateNearbyAmenitiesByKey(
    key: string,
    updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto
  ): Promise<Residence> {
    if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
      throw new ForbiddenException('Welcome Flow Disabled');
    }

    const foundResidence = await this.residenceRepository.find({ key });

    if (!foundResidence) {
      throw new NotFoundException(`Residence with Key ${key} not found`);
    }

    await this.checkResidenceRejectedStatus(foundResidence._id.toString());

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
    };

    const residenceDraft = await this.checkResidenceDraft(foundResidence._id.toString());

    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, {
        nearbyAmenities: transformedDto,
      });
    }
    const residence: Residence = await this.residenceRepository.findById(
      foundResidence._id.toString()
    );

    const plainResidence = residence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    const newResidenceDraft = {
      ...plainResidence,
      nearbyAmenities: transformedDto,
      residenceId: new Types.ObjectId(foundResidence._id.toString()),
      status: ResidenceStatus.DRAFT,
    };

    return await this.residenceDraftRepository.create(newResidenceDraft);
  }

  async streamCsvData(stream: PassThrough) {
    const csvStream = fastcsv.format({
      headers: true,
      quoteColumns: true,
    });
    csvStream.pipe(stream);

    const batchSize = 100;
    let skip = 0;
    let hasMoreData = true;
    let hasWrittenAnyData = false;

    while (hasMoreData) {
      const residences = await this.residenceRepository.listResidenceWithUniqueUrl(skip, batchSize);

      if (residences.length < batchSize) {
        hasMoreData = false;
      }

      if (residences.length > 0) {
        residences.forEach((residence) => {
          console.log('Current residence object:', JSON.stringify(residence, null, 2));
        });

        const flattenedData = residences.map((residence) => ({
          'Residence Name': residence?.name || '-',
          'Status': residence?.status || '-',
          'Unique URL': residence?.uniqueUrl || '-',
          'City': residence.city?.[0]?.name || '-',
          'Country': residence.country?.[0]?.name || '-',
          'State': residence.state?.[0]?.name || '-',
          'Last Updated': residence.lastUpdated
            ? new Date(residence.lastUpdated).toLocaleString()
            : '-',
          'Created At': residence.createdAt ? new Date(residence.createdAt).toLocaleString() : '-',
        }));

        flattenedData.forEach((row) => csvStream.write(row));
        hasWrittenAnyData = true;
      }

      skip += batchSize;
    }

    if (!hasWrittenAnyData) {
      // Write at least one row to ensure headers are present
      csvStream.write({
        'Residence Name': '-',
        'Status': '-',
        'Unique URL': '-',
        'Developer Name': '-',
        'Developer Email': '-',
        'Developer Contact': '-',
        'City': '-',
        'Country': '-',
        'State': '-',
        'Last Updated': '-',
        'Created At': '-',
      });
    }

    csvStream.end();
  }

  async patchResidence(key: string, patchResidenceDto: PatchResidenceDto): Promise<Residence> {
    if (!process.env.WELCOME_FLOW_ENABLED || process.env.WELCOME_FLOW_ENABLED === 'false') {
      throw new ForbiddenException('Welcome Flow Disabled');
    }

    const foundResidence = await this.residenceRepository.find({ key });

    if (!foundResidence) {
      throw new NotFoundException(`Residence with Key ${key} not found`);
    }

    await this.checkResidenceRejectedStatus(foundResidence._id.toString());

    const transformedDto: any = {
      ...patchResidenceDto,
      residenceTypeIds: patchResidenceDto.residenceTypeIds
        ? patchResidenceDto.residenceTypeIds.map((typeId) => new Types.ObjectId(typeId))
        : undefined,
      locationId: patchResidenceDto.locationId
        ? new Types.ObjectId(patchResidenceDto.locationId)
        : undefined,
      associatedBrandId: patchResidenceDto.associatedBrandId
        ? new Types.ObjectId(patchResidenceDto.associatedBrandId)
        : undefined,
    };

    if (patchResidenceDto.visuals) {
      transformedDto.visuals = {
        ...patchResidenceDto.visuals,
        mainPhotos: patchResidenceDto.visuals.mainPhotos
          ? patchResidenceDto.visuals.mainPhotos.map((id) => new Types.ObjectId(id))
          : undefined,
        mainGalleryPhotos: patchResidenceDto.visuals.mainGalleryPhotos
          ? patchResidenceDto.visuals.mainGalleryPhotos.map((id) => new Types.ObjectId(id))
          : undefined,
        secondGalleryPhotos: patchResidenceDto.visuals.secondGalleryPhotos
          ? patchResidenceDto.visuals.secondGalleryPhotos.map((id) => new Types.ObjectId(id))
          : undefined,
        videoTour: patchResidenceDto.visuals.videoTour
          ? new Types.ObjectId(patchResidenceDto.visuals.videoTour)
          : undefined,
      };
    }

    if (patchResidenceDto.residenceKeyFeatures?.featureIds) {
      transformedDto.residenceKeyFeatures = {
        ...patchResidenceDto.residenceKeyFeatures,
        featureIds: patchResidenceDto.residenceKeyFeatures.featureIds.map(
          (id) => new Types.ObjectId(id)
        ),
      };
    }

    if (patchResidenceDto.nearbyAmenities) {
      transformedDto.nearbyAmenities = {
        amenitiesList: patchResidenceDto.nearbyAmenities.amenitiesList
          ? patchResidenceDto.nearbyAmenities.amenitiesList.map((id) => new Types.ObjectId(id))
          : undefined,
        highlightedAmenities: patchResidenceDto.nearbyAmenities.highlightedAmenities
          ? patchResidenceDto.nearbyAmenities.highlightedAmenities.map((amenity) => ({
              ...amenity,
              amenityId: new Types.ObjectId(amenity.amenityId),
              imageId: new Types.ObjectId(amenity.imageId),
            }))
          : undefined,
      };
    }

    if (patchResidenceDto.address?.city) {
      const cityName = patchResidenceDto.address.city.trim();
      const cityDetails = await this.cityRepository.findByCityName(cityName);

      if (!cityDetails) {
        throw new NotFoundException(`Unsupported city ${cityName}`);
      }

      transformedDto.cityId = new Types.ObjectId(cityDetails.id);
      transformedDto.countryId = new Types.ObjectId(cityDetails.countryId);
      transformedDto.stateId = new Types.ObjectId(cityDetails.stateId);
      transformedDto.address = patchResidenceDto.address;
    }

    const residenceDraft = await this.checkResidenceDraft(foundResidence._id.toString());

    if (residenceDraft) {
      const existingData = residenceDraft.toObject();
      delete existingData._id;
      delete existingData.__v;
      return await this.residenceDraftRepository.update(residenceDraft.id, {
        ...existingData,
        ...transformedDto,
      });
    }

    const plainResidence = foundResidence.toJSON();
    delete plainResidence._id;
    delete plainResidence.status;

    return await this.residenceDraftRepository.create({
      ...plainResidence,
      ...transformedDto,
      residenceId: new Types.ObjectId(foundResidence._id.toString()),
      status: ResidenceStatus.DRAFT,
    });
  }
}
