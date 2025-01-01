import { Injectable, BadRequestException } from '@nestjs/common';
import { BbrVerificationRepository } from './bbr-verification.repository';
import { CreateBbrVerificationDto } from './dto/create-bbr-verification.dto';
import { UpdateBbrVerificationDto } from './dto/update-bbr-verification.dto';
import { Types } from 'mongoose';
import { UserRepository } from 'src/users/user.repository';
import { UserRole } from 'src/users/enum/user.enum';
import { ListBbrVerificationDto } from './dto/list-bbr-verification.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from 'src/residences/residences.repository';
import { BbrVerificationStatus } from './enum/bbr-verification-status';
import { VerificationType } from './enum/verification-type.enum';
import { PlanRepository } from 'src/subscription-plan/plan.repository';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';

@Injectable()
export class BbrVerificationService {
  constructor(
    private readonly bbrVerificationRepository: BbrVerificationRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly planRepository: PlanRepository,
    private readonly residenceActivityLogRepository: ResidenceActivityLogRepository,
    private readonly developerProfileActivityLogRepository: DeveloperProfileActivityLogRepository,
  ) {}

  async create(createBbrVerificationDto: CreateBbrVerificationDto, userId: string) {
    const residence = await this.residenceRepository.findById(
      createBbrVerificationDto.residenceId.toString()
    );
    if (!residence) {
      throw new BadRequestException('Residence not found');
    }

    const plan = await this.planRepository.findById(createBbrVerificationDto.planId.toString());
    if (!plan) {
      throw new BadRequestException('Plan not found');
    }
    const hasActiveRequest = await this.bbrVerificationRepository.hasActiveOrPendingRequest(
      createBbrVerificationDto.residenceId.toString()
    );

    if (hasActiveRequest) {
      throw new BadRequestException(
        'Residence already has an active or pending verification request'
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== UserRole.ADMIN && !createBbrVerificationDto.transactionId) {
      throw new BadRequestException('Payment details are required');
    }

    const verification = await this.bbrVerificationRepository.create({
      ...createBbrVerificationDto,
      createdBy: new Types.ObjectId(userId),
      residenceId: new Types.ObjectId(createBbrVerificationDto.residenceId),
    });

    await this.residenceActivityLogRepository.create({
      residenceId: new Types.ObjectId(createBbrVerificationDto.residenceId),
      activityType: `Submitted for ${plan.name}`,
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    await this.developerProfileActivityLogRepository.create({
      developerId: new Types.ObjectId(userId),
      activityType: `Requested ${plan.name}`,
      details: {
        residenceName: residence.name,
      },
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return verification;
  }

  async update(id: string, updateBbrVerificationDto: UpdateBbrVerificationDto, userId: string) {
    const verification = await this.bbrVerificationRepository.findById(id);

    if (!verification) {
      throw new BadRequestException('Verification not found');
    }
    if (
      updateBbrVerificationDto.status &&
      updateBbrVerificationDto.status === BbrVerificationStatus.APPROVED
    ) {
      const residence = await this.residenceRepository.findById(
        verification.residenceId.toString()
      );
      if (residence && verification.verificationType === VerificationType.E_VERIFICATION) {
        await this.residenceRepository.update(residence._id.toString(), {
          eVerification: true,
          verifiedOn: updateBbrVerificationDto.verifiedOn,
        });
        await this.residenceActivityLogRepository.create({
          residenceId: new Types.ObjectId(residence.id),
          activityType: 'E-verified',
          userId: new Types.ObjectId(userId),
          createdAt: new Date(),
        });
      }
      if (residence && verification.verificationType === VerificationType.ONSITE_VERIFICATION) {
        await this.residenceRepository.update(residence._id.toString(), {
          onsiteVerification: true,
          verifiedOn: updateBbrVerificationDto.verifiedOn,
        });
        await this.residenceActivityLogRepository.create({
          residenceId: new Types.ObjectId(residence.id),
          activityType: 'Verified onsite',
          userId: new Types.ObjectId(userId),
          createdAt: new Date(),
        });
      }
    }
    return this.bbrVerificationRepository.update(id, {
      ...updateBbrVerificationDto,
      updatedBy: new Types.ObjectId(userId),
    });
  }

  async list(listBbrVerificationDto: ListBbrVerificationDto) {
    const result =
      await this.bbrVerificationRepository.findAllVerifications(listBbrVerificationDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listBbrVerificationDto
    );
    return { pagination, verifications: data };
  }

  async findById(id: string) {
    const result = await this.bbrVerificationRepository.findByIdInDetail(id);
    const verification = result[0]?.data;
    if (!verification) {
      throw new BadRequestException('Verification not found');
    }
    return verification?.[0];
  }

  async delete(id: string, userId: string) {
    const verification = await this.bbrVerificationRepository.findById(id);
    if (!verification) {
      throw new BadRequestException('Verification not found');
    }

    return this.bbrVerificationRepository.update(id, {
      isDeleted: true,
      updatedBy: new Types.ObjectId(userId),
    });
  }
}
