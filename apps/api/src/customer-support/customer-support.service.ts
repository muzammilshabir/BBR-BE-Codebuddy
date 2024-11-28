import { Injectable } from '@nestjs/common';
import { CustomerSupportRepository } from './customer-support.repository';
import { CreateCustomerSupportDto } from './dto/create-customer-support.dto';
import { CustomerSupport } from './schema/customer-support.schema';
import { Types } from 'mongoose';
import { ListCustomerSupportDto } from './dto/list-customer-support.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from '../residences/residences.repository';
import { UpdateCustomerSupportDto } from './dto/update-customer-support.dto';
import { UnitRepository } from 'src/unit/unit.repository';
import { DeletionStatus } from 'src/unit/enum/unit-enum';
import { UserRole } from '../users/enum/user.enum';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';

@Injectable()
export class CustomerSupportService {
  constructor(
    private readonly customerSupportRepository: CustomerSupportRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository
  ) {}
  async getDeveloperId(createCustomerSupportDto: CreateCustomerSupportDto) {
    if (createCustomerSupportDto.developerId) {
      return new Types.ObjectId(createCustomerSupportDto.developerId);
    }
    if (createCustomerSupportDto.residenceId) {
      return (
        await this.residenceRepository.findById(createCustomerSupportDto.residenceId.toString())
      ).developerId;
    }
    if (createCustomerSupportDto.unitId) {
      const residenceId = (
        await this.unitRepository.findById(createCustomerSupportDto.unitId.toString())
      ).residenceId;
      return (await this.residenceRepository.findById(residenceId.toString())).developerId;
    }
    return null;
  }
  async create(createCustomerSupportDto: CreateCustomerSupportDto): Promise<CustomerSupport> {
    const transformedDto = {
      ...createCustomerSupportDto,
      residenceId: createCustomerSupportDto.residenceId
        ? new Types.ObjectId(createCustomerSupportDto.residenceId)
        : undefined,
      unitId: createCustomerSupportDto.unitId
        ? new Types.ObjectId(createCustomerSupportDto.unitId)
        : undefined,
      developerId: await this.getDeveloperId(createCustomerSupportDto),
      preferences: {
        ...createCustomerSupportDto.preferences,
        brandIds:
          createCustomerSupportDto?.preferences?.brandIds?.map(
            (brandId) => new Types.ObjectId(brandId)
          ) || undefined,
        residenceTypeIds:
          createCustomerSupportDto?.preferences?.residenceTypeIds?.map(
            (residenceTypeId) => new Types.ObjectId(residenceTypeId)
          ) || undefined,
        lifeStyleIds:
          createCustomerSupportDto?.preferences?.lifeStyleIds?.map(
            (lifeStyleId) => new Types.ObjectId(lifeStyleId)
          ) || undefined,
        locationIds:
          createCustomerSupportDto?.preferences?.locationIds?.map(
            (locationId) => new Types.ObjectId(locationId)
          ) || undefined,
      },
      contactInfo: {
        ...createCustomerSupportDto?.contactInfo,
        countryId: createCustomerSupportDto.contactInfo
          ? new Types.ObjectId(createCustomerSupportDto.contactInfo.countryId)
          : undefined,
      },
      customerSupportFeatureRequest: {
        ...createCustomerSupportDto?.customerSupportFeatureRequest,
        documents: createCustomerSupportDto?.customerSupportFeatureRequest?.documents?.map(
          (document) => new Types.ObjectId(document)
        ) || undefined,
      },
      customerSupportErrorReport: {
        ...createCustomerSupportDto?.customerSupportErrorReport,
        documents: createCustomerSupportDto?.customerSupportErrorReport?.documents?.map(
          (document) => new Types.ObjectId(document)
        ) || undefined,
      },
    };

    return await this.customerSupportRepository.create(transformedDto);
  }

  async getCustomerSupports(filterDto: ListCustomerSupportDto, developerId?: string) {
    const { status, source, search } = filterDto;

    const query: any = {
      isDeleted: DeletionStatus.ACTIVE,
    };

    if (developerId) {
      query.developerId = developerId;
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { unitId: { $regex: search, $options: 'i' } },
        { residenceId: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(filterDto);

    const { data, count } = await this.customerSupportRepository.findAll(query, options, [
      { path: 'residenceId' },
      { path: 'unitId' },
      { path: 'developerId', select: 'fullName email role' },
      'user',
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, filterDto);

    return { pagination, customerSupports: data };
  }

  async updateCustomerSupport(
    customerSupportId: string,
    updateCustomerSupportDto: UpdateCustomerSupportDto
  ): Promise<any> {
    const transformedDto = {
      ...updateCustomerSupportDto,
      unitId: updateCustomerSupportDto.unitId
        ? new Types.ObjectId(updateCustomerSupportDto.unitId)
        : undefined,
      preferences: {
        ...updateCustomerSupportDto?.preferences,
        brandIds:
          updateCustomerSupportDto?.preferences?.brandIds?.map(
            (brandId) => new Types.ObjectId(brandId)
          ) || undefined,
        residenceTypeIds:
          updateCustomerSupportDto?.preferences?.residenceTypeIds?.map(
            (residenceTypeId) => new Types.ObjectId(residenceTypeId)
          ) || undefined,
        lifeStyleIds:
          updateCustomerSupportDto?.preferences?.lifeStyleIds?.map(
            (lifeStyleId) => new Types.ObjectId(lifeStyleId)
          ) || undefined,
        locationIds:
          updateCustomerSupportDto?.preferences?.locationIds?.map(
            (locationId) => new Types.ObjectId(locationId)
          ) || undefined,
      },
      contactInfo: {
        ...updateCustomerSupportDto?.contactInfo,
        countryId: updateCustomerSupportDto.contactInfo
          ? new Types.ObjectId(updateCustomerSupportDto.contactInfo.countryId)
          : undefined,
      },
      customerSupportFeatureRequest: {
        ...updateCustomerSupportDto?.customerSupportFeatureRequest,
        documents: updateCustomerSupportDto?.customerSupportFeatureRequest?.documents?.map(
          (document) => new Types.ObjectId(document)
        ) || undefined,
      },
      customerSupportErrorReport: {
        ...updateCustomerSupportDto?.customerSupportErrorReport,
        documents: updateCustomerSupportDto?.customerSupportErrorReport?.documents?.map(
          (document) => new Types.ObjectId(document)
        ) || undefined,
      },
      assignedTo: updateCustomerSupportDto.assignedTo?.map(
        (assignedTo) => new Types.ObjectId(assignedTo)
      ) || undefined,
    };

    return this.customerSupportRepository.update(customerSupportId, transformedDto);
  }

  getCustomerSupport(customerSupportId: string, userId?: string): Promise<CustomerSupport> {
    return userId
      ? this.customerSupportRepository.find({
          _id: customerSupportId,
          developerId: userId,
        })
      : this.customerSupportRepository.findById(customerSupportId);
  }

  async getCustomerSupportsWithRole(query: ListCustomerSupportDto, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.getCustomerSupports(query, user.sub)
      : await this.getCustomerSupports(query);
  }

  async getCustomerSupportWithRole(customerSupportId: string, user: JwtPayloadType) {
    return user.role === UserRole.SELLER
      ? await this.getCustomerSupport(customerSupportId, user.sub)
      : await this.getCustomerSupport(customerSupportId);
  }
}
