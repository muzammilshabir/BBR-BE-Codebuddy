import { Injectable, BadRequestException } from '@nestjs/common';
import { FeatureRequestRepository } from './featureRequests.repository';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';
import { UpdateFeatureRequestDto } from './dto/update-feature-request.dto';
import { Types } from 'mongoose';
import { CustomerSupportService } from 'src/customer-support/customer-support.service';

@Injectable()
export class FeatureRequestService {
  constructor(
    private readonly featureRequestRepository: FeatureRequestRepository,
    private readonly customerSupportService: CustomerSupportService,
  ) {}

  async create(createFeatureRequestDto: CreateFeatureRequestDto, userId: string) {
    const hasActiveRequest = await this.featureRequestRepository.hasActiveOrPendingRequest(
      createFeatureRequestDto.residenceId.toString()
    );

    if (hasActiveRequest) {
      throw new BadRequestException('Residence already has an active or pending feature request');
    }

    const featureRequest = await this.featureRequestRepository.create({
      ...createFeatureRequestDto,
      createdBy: new Types.ObjectId(userId),
    });

    // TODO: Integrate with payment service
    // After payment success:
    // 1. Update paymentStatus
    // 2. Create customer support ticket
    await this.customerSupportService.create({
      name: 'New Feature Request',
      message: `New feature request created for residence ${createFeatureRequestDto.residenceId}`,
      phoneNumber: {
        countryCode: '+1',
        number: '1234567890'
      },
      email: 'test@test.com'
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
    return this.featureRequestRepository.getActiveFeatureRequests();
  }
} 