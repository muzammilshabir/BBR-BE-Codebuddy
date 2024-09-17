import { Injectable } from '@nestjs/common';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ListResidenceDraftDto } from './dto/listResidenceDraft.dto';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { ResidenceService } from '../residences/residences.service';
import { ResidenceStatus } from '../residences/enum/residence-enum';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ResidenceRepository } from '../residences/residences.repository';

@Injectable()
export class ResidenceDraftService {
  constructor(
    private readonly residenceDraftRepository: ResidenceDraftRepository,
    private readonly residenceService: ResidenceService,
    private readonly residenceRepository: ResidenceRepository
  ) {}

  async listResidencesDraft(listResidenceDraftDto: ListResidenceDraftDto) {
    const filter: any = {};
    if (listResidenceDraftDto.status) {
      filter.status = listResidenceDraftDto.status;
    }
    if (listResidenceDraftDto.cityId) {
      filter.cityId = new Types.ObjectId(listResidenceDraftDto.cityId);
    }
    if (listResidenceDraftDto.developerId) {
      filter.developerId = new Types.ObjectId(listResidenceDraftDto.developerId);
    }

    if (listResidenceDraftDto.search) {
      filter.$or = [{ name: { $regex: listResidenceDraftDto.search, $options: 'i' } }];
    }

    const options = PaginationService.prepareOptions(listResidenceDraftDto);

    const { data, count } = await this.residenceDraftRepository.findAll(filter, options, [
      { path: 'residenceTypeId', select: 'type' },
      { path: 'cityId', select: 'name parentId' },
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
      };
    });
    const transformedResidence = await this.residenceService.transformResidences(updatedData);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listResidenceDraftDto);

    return { pagination, residencesDraft: transformedResidence };
  }

  async getResidenceDraftById(residenceDraftId: string): Promise<any> {
    const residenceDetails = await this.residenceDraftRepository.findByIdInDetail(residenceDraftId);
    return residenceDetails;
  }

  async createApprovalRequest(residenceId: string, userId: string): Promise<any> {
    const residence = await this.residenceRepository.findById(residenceId);
    if (!residence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }
    if (residence.status === ResidenceStatus.REJECTED) {
      throw new BadRequestException(`Rejected Residence cannot be updated`);
    }

    const residenceDraft = await this.residenceDraftRepository.find({
      residenceId: new Types.ObjectId(residenceId),
      status: ResidenceStatus.DRAFT,
    });
    if (!residenceDraft) {
      throw new NotFoundException(
        `Residence draft request with residenceId ${residenceId} and status ${ResidenceStatus.DRAFT}`
      );
    }

    // When a residence is created for the first time, it will be marked as pending. An admin will then review and approve the residence.
    if (residence.status === ResidenceStatus.DRAFT) {
      return await this.handleFirstTimeApproval(residenceDraft, residenceId, userId);
    }

    if (residence.status === ResidenceStatus.ACTIVE) {
      // Compare image fields between residence and residenceDraft
      const isImagesChanged = this.compareImages(residence, residenceDraft);

      // If images changed, mark draft as pending
      if (isImagesChanged) {
        const pendingResidenceDraft = await this.markAsPending(residenceDraft.id, userId);
        return { residenceDraft: pendingResidenceDraft };
      } else {
        // No changes, update residence and mark draft as active
        const activeResidenceDraft = await this.residenceDraftRepository.update(residenceDraft.id, {
          status: ResidenceStatus.ACTIVE,
          updatedById: new Types.ObjectId(userId),
        });

        const plainUpdatedDrafRequest = activeResidenceDraft.toJSON();
        delete plainUpdatedDrafRequest.residenceId;
        delete plainUpdatedDrafRequest._id;

        await this.residenceRepository.update(residenceId, {
          ...plainUpdatedDrafRequest,
        });
        return { residenceDraft: activeResidenceDraft };
      }
    }
  }

  private async handleFirstTimeApproval(residenceDraft: any, residenceId: string, userId: string) {
    console.log(`First-time approval for residence ID ${residenceId}`);

    const pendingResidenceDraft = await this.markAsPending(residenceDraft.id, userId);
    await this.residenceRepository.update(residenceId, {
      status: ResidenceStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });

    return { residenceDraft: pendingResidenceDraft };
  }

  private async markAsPending(residenceDraftId: string, userId: string) {
    return await this.residenceDraftRepository.update(residenceDraftId, {
      status: ResidenceStatus.PENDING,
      updatedById: new Types.ObjectId(userId),
    });
  }

  private compareImages(residence: any, residenceDraft: any): boolean {
    return (
      !this.areArraysDifferent(residence.visuals?.mainPhotos, residenceDraft.visuals?.mainPhotos) ||
      !this.areArraysDifferent(
        residence.visuals?.mainGalleryPhotos,
        residenceDraft.visuals?.mainGalleryPhotos
      ) ||
      !this.areArraysDifferent(
        residence.visuals?.secondGalleryPhotos,
        residenceDraft.visuals?.secondGalleryPhotos
      ) ||
      this.areSingleValuesDifferent(
        residence.visuals?.videoTour?.toString(),
        residenceDraft.visuals?.videoTour?.toString()
      ) ||
      this.hasNearbyAmenitiesImageChanged(residence.nearbyAmenities, residenceDraft.nearbyAmenities)
    );
  }

  // Helper to compare arrays of object IDs (optional arrays)
  private areArraysDifferent(arr1?: Types.ObjectId[], arr2?: Types.ObjectId[]): boolean {
    if (!arr1 && !arr2) return false; // If both arrays do not exist, treat them as identical
    if (!arr1 || !arr2) return true; // If only one array exists, return true (consider as changed)
    return (
      arr1.length === arr2.length &&
      arr1.every((id, index) => id.toString() === arr2[index]?.toString())
    );
  }
  private areSingleValuesDifferent(val1?: string, val2?: string): boolean {
    if (!val1 && !val2) return false;
    return val1 !== val2;
  }

  private hasNearbyAmenitiesImageChanged(
    nearbyAmenities1?: { highlightedAmenities: { imageId: Types.ObjectId }[] }[],
    nearbyAmenities2?: { highlightedAmenities: { imageId: Types.ObjectId }[] }[]
  ): boolean {
    if (!nearbyAmenities1 && !nearbyAmenities2) return false; // Both undefined or null, treat as identical
    if (!nearbyAmenities1 || !nearbyAmenities2) return true; // One exists and the other doesn't, consider as changed
    if (nearbyAmenities1.length !== nearbyAmenities2.length) return true; // Different number of amenities, consider as changed

    // Compare each highlighted amenity's imageId
    return nearbyAmenities1.some((amenity, index) => {
      const draftAmenity = nearbyAmenities2[index];
      return amenity.highlightedAmenities.some(
        (highlightedAmenity, i) =>
          highlightedAmenity.imageId.toString() !==
          draftAmenity.highlightedAmenities[i]?.imageId.toString()
      );
    });
  }
}
