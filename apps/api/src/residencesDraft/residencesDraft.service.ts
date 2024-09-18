import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResidenceDraftRepository } from './residencesDraft.repository';
import { ListResidenceDraftDto } from './dto/listResidenceDraft.dto';
import { Types } from 'mongoose';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { ResidenceService } from '../residences/residences.service';
import { ResidenceStatus } from '../residences/enum/residence-enum';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ResidenceRepository } from '../residences/residences.repository';
import { UnitRepository } from '../unit/unit.repository';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';

@Injectable()
export class ResidenceDraftService {
  constructor(
    private readonly residenceDraftRepository: ResidenceDraftRepository,
    private readonly residenceService: ResidenceService,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository,
    private readonly unitDraftRepository: UnitDraftRepository
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
    try {
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

          await this.updateUnitAndDraftStatus(residenceId, userId, ResidenceStatus.PENDING);

          return { residenceDraft: pendingResidenceDraft };
        } else {
          const isUnitImagesChanged = await this.areUnitImagesChanged(residenceId);
          if (isUnitImagesChanged) {
            const pendingResidenceDraft = await this.markAsPending(residenceDraft.id, userId);

            await this.updateUnitAndDraftStatus(residenceId, userId, ResidenceStatus.PENDING);
            return { residenceDraft: pendingResidenceDraft };
          } else {
            await this.updateUnitAndDraftStatus(residenceId, userId, ResidenceStatus.ACTIVE);

            // No changes, update residence and mark draft as active
            const activeResidenceDraft = await this.residenceDraftRepository.update(
              residenceDraft.id,
              {
                status: ResidenceStatus.ACTIVE,
                updatedById: new Types.ObjectId(userId),
              }
            );

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
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while creating approval request for the residence',
        error
      );
    }
  }

  private async handleFirstTimeApproval(residenceDraft: any, residenceId: string, userId: string) {
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
      !this.areArraysDifferent(
        residence.visuals?.mainPhotos ?? [],
        residenceDraft.visuals?.mainPhotos ?? []
      ) ||
      !this.areArraysDifferent(
        residence.visuals?.mainGalleryPhotos ?? [],
        residenceDraft.visuals?.mainGalleryPhotos ?? []
      ) ||
      !this.areArraysDifferent(
        residence.visuals?.secondGalleryPhotos ?? [],
        residenceDraft.visuals?.secondGalleryPhotos ?? []
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

  private async updateUnitAndDraftStatus(
    residenceId: string,
    userId: string,
    status: ResidenceStatus
  ) {
    const units = await this.unitRepository.findAll({
      residenceId: new Types.ObjectId(residenceId),
    });

    if (units.count > 0) {
      const unitUpdatePromises = units.data.map(async (unit) => {
        const unitId = unit._id.toString();

        // Check if there's a draft for this specific unit
        const existingUnitDraft = await this.unitDraftRepository.find({
          unitId: new Types.ObjectId(unitId),
          status: { $in: [ResidenceStatus.DRAFT, ResidenceStatus.PENDING] },
        });

        if (existingUnitDraft) {
          // Update the unit draft status
          const unitDraftRequest = await this.unitDraftRepository.update(existingUnitDraft.id, {
            updatedById: new Types.ObjectId(userId),
            status,
          });

          const unitDraftData = unitDraftRequest.toJSON();
          delete unitDraftData.unitId;
          delete unitDraftData._id;

          if (unit.status === ResidenceStatus.DRAFT) {
            let unitUpdatePaylod: any = {
              updatedById: new Types.ObjectId(userId),
              status,
            };

            if (status === ResidenceStatus.ACTIVE) {
              unitUpdatePaylod = { ...unitDraftData };
            }

            await this.unitRepository.update(unitId, unitUpdatePaylod);
          }

          if (unit.status === ResidenceStatus.ACTIVE && status === ResidenceStatus.ACTIVE) {
            await this.unitRepository.update(unitId, unitDraftData);
          }
        }
      });

      await Promise.all(unitUpdatePromises);
    }
  }

  private async areUnitImagesChanged(residenceId: string): Promise<boolean> {
    const units = await this.unitRepository.findAll({
      residenceId: new Types.ObjectId(residenceId),
    });

    if (units.count > 0) {
      const unitUpdatePromises = units.data.map(async (unit) => {
        const unitId = unit._id.toString();

        const existingUnitDraft = await this.unitDraftRepository.find({
          unitId: new Types.ObjectId(unitId),
          status: { $in: [ResidenceStatus.DRAFT, ResidenceStatus.PENDING] },
        });

        if (existingUnitDraft) {
          // Compare all image fields between the unit and unitDraft
          const isImageChanged = this.compareUnitImages(unit, existingUnitDraft);

          if (isImageChanged) {
            return true;
          }
        }
        return false;
      });

      const unitImageChanges = await Promise.all(unitUpdatePromises);

      // If any unit has image changes, return true
      if (unitImageChanges.some((change) => change)) {
        return true;
      }
    }

    // If no unit has image changes, return false
    return false;
  }

  private compareUnitImages(unit: any, unitDraft: any): boolean {
    return (
      !this.areArraysDifferent(
        unit.visuals?.mainGalleryPhotos ?? [],
        unitDraft.visuals?.mainGalleryPhotos ?? []
      ) ||
      !this.areArraysDifferent(
        unit.visuals?.secondGalleryPhotos ?? [],
        unitDraft.visuals?.secondGalleryPhotos ?? []
      ) ||
      this.areSingleValuesDifferent(
        unit.visuals?.videoTour?.toString(),
        unitDraft.visuals?.videoTour?.toString()
      )
    );
  }
}
