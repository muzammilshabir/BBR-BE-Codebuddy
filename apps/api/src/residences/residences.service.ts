import { Injectable } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';
import { RejectResidenceDto, UpdateResidenceDto } from './dto/update-residence.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { AddKeyFeaturesDto } from './dto/residenceKeyFeatures.dto';
import { AddResidenceVisualsDto } from './dto/add-visuals.dto';
import { Types } from 'mongoose';
import { UpdateNearbyAmenitiesDto } from './dto/update-nearby-amenities.dto';
import {
  ListResidenceByFiltersDto,
  ListResidenceByFiltersQueryPropsDto,
  ListResidenceDto,
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

@Injectable()
export class ResidenceService {
  constructor(
    private readonly residenceRepository: ResidenceRepository,
    private readonly cityRepository: CityRepository,
    private readonly residenceDraftRepository: ResidenceDraftRepository
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

      transformedDto.cityId = cityDetails.id;
      transformedDto.countryId = cityDetails.countryId;
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

      transformedDto.cityId = cityDetails.id;
      transformedDto.countryId = cityDetails.countryId;
      transformedDto.address = updateResidenceDto.address;
    }
    const residenceDraft = await this.checkResidenceDraft(id);
    if (residenceDraft) {
      return await this.residenceDraftRepository.update(residenceDraft.id, transformedDto);
    }

    await this.residenceDraftRepository.create({
      ...transformedDto,
      residenceId: new Types.ObjectId(id),
    });
  }

  async checkResidenceRejectedStatus(residenceId: string) {
    const residence = await this.residenceRepository.findById(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
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
    id: string,
    addKeyFeaturesDto: AddKeyFeaturesDto,
    userId: string
  ): Promise<Residence> {
    const transformedDto = {
      ...addKeyFeaturesDto,
      featureIds: addKeyFeaturesDto.featureIds.map((featureId) => new Types.ObjectId(featureId)),
      updatedById: new Types.ObjectId(userId),
    };

    const existingResidence = await this.residenceRepository.update(id, {
      residenceKeyFeatures: transformedDto,
    });
    if (!existingResidence) {
      throw new NotFoundException(`Residence with ID ${id} not found`);
    }
    return existingResidence;
  }

  async addVisuals(
    id: string,
    addVisualsDto: AddResidenceVisualsDto,
    userId: string
  ): Promise<Residence> {
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
    const existingResidence = await this.residenceRepository.update(id, {
      visuals: transformedDto,
    });
    if (!existingResidence) {
      throw new NotFoundException(`Residence with ID ${id} not found`);
    }
    return existingResidence;
  }

  async updateNearbyAmenities(
    id: string,
    updateNearbyAmenitiesDto: UpdateNearbyAmenitiesDto,
    userId: string
  ): Promise<Residence> {
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

    const existingResidence = await this.residenceRepository.update(id, {
      nearbyAmenities: transformedDto,
    });
    if (!existingResidence) {
      throw new NotFoundException(`Residence with ID ${id} not found`);
    }
    return existingResidence;
  }

  async getResidenceById(residenceId: string): Promise<any> {
    const residenceDetails = await this.residenceRepository.findByIdInDetail(residenceId);
    return residenceDetails;
  }

  async approveResidence(residenceId: string, userId: string): Promise<Residence> {
    const residence = await this.getResidenceById(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    if (residence.status !== ResidenceStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve residence with status: ${residence.status}. Only pending residences can be approved.`
      );
    }

    const existingResidence = await this.residenceRepository.update(residenceId, {
      status: ResidenceStatus.ACTIVE,
      updatedById: userId,
    });

    return existingResidence;
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
      { path: 'locationId', select: 'name type parentId' },
      { path: 'associatedBrandId', select: 'name' },
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
      { path: 'createdById', model: 'User' },
      { path: 'developerId', model: 'User' },
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

  private transformResidences(residences: Residence[]): Residence[] {
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
    const residence = await this.getResidenceById(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    if (residence.status !== ResidenceStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject residence with status: ${residence.status}. Only pending residences can be rejected.`
      );
    }

    const existingResidence = await this.residenceRepository.update(residenceId, {
      status: ResidenceStatus.REJECTED,
      rejectionReason: rejectResidenceDto.rejectionReason,
      updatedById: userId,
    });
    return existingResidence;
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
}
