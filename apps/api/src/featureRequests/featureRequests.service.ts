import { Injectable, BadRequestException } from '@nestjs/common';
import { FeatureRequestRepository } from './featureRequests.repository';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';
import { UpdateFeatureRequestDto } from './dto/update-feature-request.dto';
import { Types } from 'mongoose';
import { UserRepository } from 'src/users/user.repository';
import { ListFeatureRequestDto } from './dto/list-feature-request.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdatePaymentInfoDto } from './dto/update-payment-info.dto';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { FeatureRequestStatus } from './enum/feature-request-status';
import { PlanRepository } from 'src/subscription-plan/plan.repository';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';

@Injectable()
export class FeatureRequestService {
  constructor(
    private readonly featureRequestRepository: FeatureRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly subscriptionPlanRepository: PlanRepository,
    private readonly residenceActivityLogRepository: ResidenceActivityLogRepository,
    private readonly developerProfileActivityLogRepository: DeveloperProfileActivityLogRepository
  ) {}

  async create(createFeatureRequestDto: CreateFeatureRequestDto, userId: string) {
    const residence = await this.residenceRepository.findById(
      createFeatureRequestDto.residenceId.toString()
    );
    if (!residence) {
      throw new BadRequestException('Residence not found');
    }

    const hasActiveRequest = await this.featureRequestRepository.hasActiveOrPendingRequest(
      createFeatureRequestDto.residenceId.toString()
    );

    if (hasActiveRequest) {
      throw new BadRequestException('Residence already has an active or pending feature request');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findById(
      createFeatureRequestDto.planId.toString()
    );

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    const featureRequest = await this.featureRequestRepository.create({
      ...createFeatureRequestDto,
      createdBy: new Types.ObjectId(userId),
      residenceId: new Types.ObjectId(createFeatureRequestDto.residenceId),
      planId: new Types.ObjectId(createFeatureRequestDto.planId),
    });

    await this.residenceActivityLogRepository.create({
      residenceId: new Types.ObjectId(residence.id),
      activityType: 'Added to Featured',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.developerProfileActivityLogRepository.create({
      developerId: new Types.ObjectId(userId),
      activityType: 'Added to Featured',
      details: {
        residenceName: residence.name,
      },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return featureRequest;
  }

  async update(id: string, updateFeatureRequestDto: UpdateFeatureRequestDto, userId: string) {
    const featureRequest = await this.featureRequestRepository.findById(id);

    if (!featureRequest) {
      throw new BadRequestException('Feature request not found');
    }

    if (
      updateFeatureRequestDto.status &&
      updateFeatureRequestDto.status === FeatureRequestStatus.APPROVED
    ) {
      await this.residenceRepository.update(featureRequest.residenceId.toString(), {
        isFeatured: true,
      });
    }

    if (
      updateFeatureRequestDto.status &&
      updateFeatureRequestDto.status === FeatureRequestStatus.WITHDRAWN &&
      updateFeatureRequestDto.withdrawnOn
    ) {
      await this.residenceRepository.update(featureRequest.residenceId.toString(), {
        isFeatured: false,
      });
    }

    return this.featureRequestRepository.update(id, {
      ...updateFeatureRequestDto,
      updatedBy: new Types.ObjectId(userId),
    });
  }

  async getFeaturedResidences() {
    const featuredResidences = await this.featureRequestRepository.getActiveFeatureRequests();
    if (!featuredResidences?.length) {
      return {
        totalCount: 0,
        data: [],
      };
    }
    return {
      totalCount: featuredResidences.length,
      data: featuredResidences,
    };
  }

  async list(listFeatureRequestDto: ListFeatureRequestDto) {
    const result = await this.featureRequestRepository.findAllFeatureRequest(listFeatureRequestDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, listFeatureRequestDto);
    return { pagination, featureRequests: data };
  }

  async findById(id: string) {
    const result = await this.featureRequestRepository.findByIdInDetail(id);
    const featureRequest = result[0]?.data;
    if (!featureRequest) {
      throw new BadRequestException('Feature request not found');
    }
    return featureRequest?.[0];
  }

  async delete(id: string, userId: string) {
    const featureRequest = await this.featureRequestRepository.findById(id);
    if (!featureRequest) {
      throw new BadRequestException('Feature request not found');
    }
    const currentDate = new Date();
    if (
      featureRequest.status === FeatureRequestStatus.APPROVED &&
      currentDate > featureRequest.featuredFrom &&
      currentDate < featureRequest.featuredTo
    ) {
      await this.residenceRepository.update(featureRequest.residenceId.toString(), {
        isFeatured: false,
      });

      await this.residenceActivityLogRepository.create({
        residenceId: new Types.ObjectId(featureRequest.residenceId),
        activityType: 'Removed from Featured',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }
    return this.featureRequestRepository.update(id, {
      isDeleted: true,
      updatedBy: new Types.ObjectId(userId),
    });
  }

  async updatePaymentInfo(id: string, updatePaymentInfoDto: UpdatePaymentInfoDto, userId: string) {
    // TODO: will be refactored to use the update method
    const featureRequest = await this.featureRequestRepository.findById(id);

    if (!featureRequest) {
      throw new BadRequestException('Feature request not found');
    }

    return this.featureRequestRepository.update(id, {
      ...updatePaymentInfoDto,
      updatedBy: new Types.ObjectId(userId),
    });
  }
}
