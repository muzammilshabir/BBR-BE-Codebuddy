import { Injectable } from '@nestjs/common';
import { ClaimRequestRepository } from './claimRequest.repository';
import {
  CreateClaimRequestDto,
  CreateClaimResidenceForDeveloperWithMatchingDomainDto,
} from './dto/createClaimRequest.dto';
import { ClaimRequest } from './schema/claimRequest.schema';
import { UserRepository } from '../users/user.repository';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ResidenceRepository } from '../residences/residences.repository';
import { UnitRepository } from '../unit/unit.repository';
import { Types } from 'mongoose';
import { ClaimRequestStatus } from './enum/claimReques-enum';
import { SignupMethod, UserRole } from '../users/enum/user.enum';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ClaimRequestService {
  constructor(
    private readonly claimRequestRepository: ClaimRequestRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository,
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async createClaimResidence(
    createClaimRequestDto: CreateClaimRequestDto,
    userId: string
  ): Promise<ClaimRequest> {
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

  private async getValidatedResidenceId(createClaimRequestDto: any) {
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

  async claimResidenceForDeveloperWithMatchingDomain(
    createClaimRequestDto: CreateClaimResidenceForDeveloperWithMatchingDomainDto,
    userId: string
  ): Promise<ClaimRequest> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.email !== createClaimRequestDto.email) {
      throw new BadRequestException(
        `User email (${user.email}) does not match the claim email (${createClaimRequestDto.email})`
      );
    }

    // Extract user email domain
    const userEmailDomain = this.extractDomain(user.email, 'email');

    const residenceId = await this.getValidatedResidenceId(createClaimRequestDto);
    const residence = await this.residenceRepository.findById(residenceId.toString());

    // Extract residence website domain
    const residenceDomain = this.extractDomain(residence.websiteLink, 'url');

    if (userEmailDomain !== residenceDomain) {
      throw new BadRequestException('User email domain does not match residence website domain');
    }

    const transformedDto = {
      ...createClaimRequestDto,
      unitId: createClaimRequestDto.unitId
        ? new Types.ObjectId(createClaimRequestDto.unitId)
        : undefined,
      residenceId: new Types.ObjectId(residenceId),
      developerId: new Types.ObjectId(userId),
      status: ClaimRequestStatus.Approved,
    };

    return await this.claimRequestRepository.create(transformedDto);
  }

  private extractDomain(input: string, type: 'url' | 'email'): string {
    if (type === 'url') {
      const urlObj = new URL(input);
      return urlObj.hostname.replace(/^www\./, ''); // Remove 'www.' if present
    } else if (type === 'email') {
      return input.split('@')[1]; // Get domain from email
    }
    throw new Error('Invalid input type. Expected "url" or "email".');
  }

  async claimResidenceForGuestWithMatchingDomain(
    createClaimRequestDto: CreateClaimResidenceForDeveloperWithMatchingDomainDto
  ): Promise<any> {
    const residenceId = await this.getValidatedResidenceId(createClaimRequestDto);
    const residence = await this.residenceRepository.findById(residenceId.toString());
    const residenceDomain = this.extractDomain(residence.websiteLink, 'url');

    const userEmailDomain = this.extractDomain(createClaimRequestDto.email, 'email');

    if (userEmailDomain !== residenceDomain) {
      throw new BadRequestException('User email domain does not match residence website domain');
    }

    const user = await this.userRepository.find({ email: createClaimRequestDto.email });
    if (user && user.isVerified === true) {
      const transformedDto = {
        ...createClaimRequestDto,
        userName: user?.fullName,
        unitId: createClaimRequestDto.unitId
          ? new Types.ObjectId(createClaimRequestDto.unitId)
          : undefined,
        residenceId: new Types.ObjectId(residenceId),
        developerId: new Types.ObjectId(user.id),
        status: ClaimRequestStatus.Pending,
      };

      return await this.claimRequestRepository.create(transformedDto);
    }

    if (!user) {
      const verificationToken = this.tokenService.generateVerificationToken();
      const userDetails = {
        corporateEmail: createClaimRequestDto.email,
        email: createClaimRequestDto.email,
        companyInfo: { corporatePhone: createClaimRequestDto.phoneNumber },
        role: UserRole.SELLER,
        signupMethod: SignupMethod.EMAIL,
        isVerified: false,
        verificationToken,
      };
      const user = await this.userRepository.create(userDetails);

      const transformedDto = {
        ...createClaimRequestDto,
        unitId: createClaimRequestDto.unitId
          ? new Types.ObjectId(createClaimRequestDto.unitId)
          : undefined,
        residenceId: new Types.ObjectId(residenceId),
        status: ClaimRequestStatus.Pending,
      };

      this.authService.sendVerificationEmail(user.email, user.verificationToken);

      return await this.claimRequestRepository.create(transformedDto);
    }
  }
}
