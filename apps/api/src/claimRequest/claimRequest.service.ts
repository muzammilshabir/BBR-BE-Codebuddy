import { Injectable } from '@nestjs/common';
import { ClaimRequestRepository } from './claimRequest.repository';
import { CreateClaimRequestDto } from './dto/createClaimRequest.dto';
import { ClaimRequest } from './schema/claimRequest.schema';
import { UserRepository } from '../users/user.repository';
import { NotFoundException } from '../../../../packages/api-core/modules/exceptions';
import { ResidenceRepository } from '../residences/residences.repository';
import { UnitRepository } from '../unit/unit.repository';
import { Types } from 'mongoose';
import { ClaimRequestStatus } from './enum/claimReques-enum';

@Injectable()
export class ClaimRequestService {
  constructor(
    private readonly claimRequestRepository: ClaimRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository
  ) {}

  async createClaimResidence(
    createClaimRequestDto: CreateClaimRequestDto,
    userId: string
  ): Promise<ClaimRequest> {
    const user = await this.userRepository.findById(userId);
    if (!user.isVerified) {
      throw new NotFoundException(`Developer is not verified`);
    }

    const residenceId = await this.getValidatedResidenceId(createClaimRequestDto);

    // check any existimg claim request exist with developerId
    await this.checkExistingClaimRequest(residenceId);

    const transformedDto = {
      ...createClaimRequestDto,
      documents: createClaimRequestDto.documents
        ? createClaimRequestDto.documents.map((documentId) => new Types.ObjectId(documentId))
        : undefined,
      unitId: createClaimRequestDto.unitId
        ? new Types.ObjectId(createClaimRequestDto.unitId)
        : undefined,
      residenceId: new Types.ObjectId(residenceId),
      developerId: new Types.ObjectId(userId),
    };

    return await this.claimRequestRepository.create(transformedDto);
  }

  private async getValidatedResidenceId(createClaimRequestDto: CreateClaimRequestDto) {
    let residenceId = createClaimRequestDto.residenceId;

    if (residenceId) {
      const residence = await this.residenceRepository.findById(residenceId.toString());
      if (!residence) {
        throw new NotFoundException(`Residence with ID ${residenceId} not found`);
      }
    }

    if (createClaimRequestDto.unitId) {
      const unit = await this.unitRepository.findById(createClaimRequestDto.unitId.toString());
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${createClaimRequestDto.unitId} not found`);
      }

      // Set residenceId from the unit if it's not already provided
      residenceId = residenceId || unit.residenceId;
    }

    if (!residenceId) {
      throw new NotFoundException(
        `Neither residenceId nor a valid unit-residence association was found.`
      );
    }

    return residenceId;
  }

  private async checkExistingClaimRequest(residenceId: string | Types.ObjectId): Promise<void> {
    const existingClaimRequest = await this.claimRequestRepository.find({
      residenceId: new Types.ObjectId(residenceId),
      status: ClaimRequestStatus.Approved,
    });

    if (existingClaimRequest) {
      throw new NotFoundException(`Residence is already claimed by another developer`);
    }
  }
}
