import { Injectable, BadRequestException } from '@nestjs/common';
import { FeatureRequestRepository } from './featureRequests.repository';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';
import { UpdateFeatureRequestDto } from './dto/update-feature-request.dto';
import { Types } from 'mongoose';
import { CustomerSupportService } from 'src/customer-support/customer-support.service';
import { UserRepository } from 'src/users/user.repository';
import { UserRole } from 'src/users/enum/user.enum';
import { ListFeatureRequestDto } from './dto/list-feature-request.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdatePaymentInfoDto } from './dto/update-payment-info.dto';
import { ResidenceRepository } from 'src/residences/residences.repository';

@Injectable()
export class FeatureRequestService {
  constructor(
    private readonly featureRequestRepository: FeatureRequestRepository,
    private readonly customerSupportService: CustomerSupportService,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository
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

    if (user.role !== UserRole.ADMIN && !createFeatureRequestDto.transactionId) {
      throw new BadRequestException('Payment details are required');
    }

    const featureRequest = await this.featureRequestRepository.create({
      ...createFeatureRequestDto,
      createdBy: new Types.ObjectId(userId),
      residenceId: new Types.ObjectId(createFeatureRequestDto.residenceId),
    });

    await this.customerSupportService.create({
      name: 'New Feature Request',
      message: `New feature request created for residence ${createFeatureRequestDto.residenceId} with id ${featureRequest._id.toString()}`,
      email: 'test@test.com',
    });

    return featureRequest;
  }

  async update(id: string, updateFeatureRequestDto: UpdateFeatureRequestDto, userId: string) {
    const featureRequest = await this.featureRequestRepository.findById(id);

    if (!featureRequest) {
      throw new BadRequestException('Feature request not found');
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
