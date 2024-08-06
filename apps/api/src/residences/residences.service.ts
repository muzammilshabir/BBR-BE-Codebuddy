import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';
import { UpdateResidenceDto } from './dto/update-residence.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { AddKeyFeaturesDto } from './dto/residenceKeyFeatures.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';
import { Types } from 'mongoose';
@Injectable()
export class ResidenceService {
  constructor(private readonly residenceRepository: ResidenceRepository) {}

  async create(createResidenceDto: CreateResidenceDto): Promise<Residence> {
    const transformedDto = {
      ...createResidenceDto,
      residenceTypeId: new Types.ObjectId(createResidenceDto.residenceTypeId),
      locationId: new Types.ObjectId(createResidenceDto.locationId),
      associatedBrandId: createResidenceDto.associatedBrandId
        ? new Types.ObjectId(createResidenceDto.associatedBrandId)
        : undefined,
    };
    return await this.residenceRepository.create(transformedDto);
  }

  async updateGeneralInfo(id: string, updateResidenceDto: UpdateResidenceDto): Promise<Residence> {
    try {
      const transformedDto: Partial<UpdateResidenceDto> = {
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
      };

      const existingResidence = await this.residenceRepository.update(id, transformedDto);
      if (!existingResidence) {
        throw new NotFoundException(`Residence with ID ${id} not found`);
      }
      return existingResidence;
    } catch (error) {
      if (error.response && error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async addKeyFeatures(id: string, addKeyFeaturesDto: AddKeyFeaturesDto): Promise<Residence> {
    try {
      const transformedDto = {
        ...addKeyFeaturesDto,
        featureIds: addKeyFeaturesDto.featureIds.map((featureId) => new Types.ObjectId(featureId)),
      };

      const existingResidence = await this.residenceRepository.addKeyFeatures(id, transformedDto);
      if (!existingResidence) {
        throw new NotFoundException(`Residence with ID ${id} not found`);
      }
      return existingResidence;
    } catch (error) {
      if (error.response && error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async addVisuals(id: string, addVisualsDto: AddVisualsDto): Promise<Residence> {
    try {
      const transformedDto = {
        ...addVisualsDto,
        mainGalleryPhotos: addVisualsDto.mainGalleryPhotos.map(
          (photoId) => new Types.ObjectId(photoId)
        ),
        secondGalleryPhotos: addVisualsDto.secondGalleryPhotos?.map(
          (photoId) => new Types.ObjectId(photoId)
        ),
        videoTour: addVisualsDto.videoTour
          ? new Types.ObjectId(addVisualsDto.videoTour)
          : undefined,
      };
      const existingResidence = await this.residenceRepository.addVisuals(id, transformedDto);
      if (!existingResidence) {
        throw new NotFoundException(`Residence with ID ${id} not found`);
      }
      return existingResidence;
    } catch (error) {
      if (error.response && error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
