import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerSupportRepository } from './customer-support.repository';
import { CreateCustomerSupportDto } from './dto/create-customer-support.dto';
import { CustomerSupport } from './schema/customer-support.schema';
import { Types } from 'mongoose';
import { ListCustomerSupportDto } from './dto/list-customer-support.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ResidenceRepository } from '../residences/residences.repository';
import { UpdateCustomerSupportDto } from './dto/update-customer-support.dto';
import { UnitRepository } from 'src/unit/unit.repository';
import { UserRole } from '../users/enum/user.enum';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { UpdateCalendlyDetailsDto } from './dto/update-calendly-details.dto';

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
      preferences: createCustomerSupportDto.preferences && {
        ...createCustomerSupportDto.preferences,
        brandIds: createCustomerSupportDto.preferences.brandIds?.map(
          (brandId) => new Types.ObjectId(brandId)
        ),
        residenceTypeIds: createCustomerSupportDto.preferences.residenceTypeIds?.map(
          (residenceTypeId) => new Types.ObjectId(residenceTypeId)
        ),
        lifeStyleIds: createCustomerSupportDto.preferences.lifeStyleIds?.map(
          (lifeStyleId) => new Types.ObjectId(lifeStyleId)
        ),
        locationIds: createCustomerSupportDto.preferences.locationIds?.map(
          (locationId) => new Types.ObjectId(locationId)
        ),
      },
      contactInfo: createCustomerSupportDto.contactInfo && {
        ...createCustomerSupportDto.contactInfo,
        countryId: createCustomerSupportDto.contactInfo.countryId
          ? new Types.ObjectId(createCustomerSupportDto.contactInfo.countryId)
          : undefined,
      },
      customerSupportFeatureRequest: createCustomerSupportDto.customerSupportFeatureRequest && {
        ...createCustomerSupportDto.customerSupportFeatureRequest,
        documents: createCustomerSupportDto.customerSupportFeatureRequest.documents?.map(
          (document) => new Types.ObjectId(document)
        ),
      },
      customerSupportErrorReport: createCustomerSupportDto.customerSupportErrorReport && {
        ...createCustomerSupportDto.customerSupportErrorReport,
        documents: createCustomerSupportDto.customerSupportErrorReport.documents?.map(
          (document) => new Types.ObjectId(document)
        ),
      },
      upload: createCustomerSupportDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
    };

    return await this.customerSupportRepository.create(transformedDto);
  }

  async getCustomerSupports(filterDto: ListCustomerSupportDto, developerId?: string) {
    const result = await this.customerSupportRepository.findAllCustomerSupports(filterDto, developerId);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, filterDto);

    return { pagination, customerSupports: data };
  }

  async updateCustomerSupport(
    customerSupportId: string,
    updateCustomerSupportDto: UpdateCustomerSupportDto
  ): Promise<any> {
    const transformedDto: any = {
      ...updateCustomerSupportDto,
      unitId: updateCustomerSupportDto.unitId
        ? new Types.ObjectId(updateCustomerSupportDto.unitId)
        : undefined,
    };

    if (updateCustomerSupportDto.preferences) {
      const { preferences } = updateCustomerSupportDto;
      transformedDto.preferences = { ...preferences };

      if (preferences.brandIds) {
        transformedDto.preferences.brandIds = preferences.brandIds.map(
          (id) => new Types.ObjectId(id)
        );
      }
      if (preferences.residenceTypeIds) {
        transformedDto.preferences.residenceTypeIds = preferences.residenceTypeIds.map(
          (id) => new Types.ObjectId(id)
        );
      }
      if (preferences.lifeStyleIds) {
        transformedDto.preferences.lifeStyleIds = preferences.lifeStyleIds.map(
          (id) => new Types.ObjectId(id)
        );
      }
      if (preferences.locationIds) {
        transformedDto.preferences.locationIds = preferences.locationIds.map(
          (id) => new Types.ObjectId(id)
        );
      }
    }

    if (updateCustomerSupportDto.contactInfo) {
      transformedDto.contactInfo = {
        ...updateCustomerSupportDto.contactInfo,
      };
      if (updateCustomerSupportDto.contactInfo.countryId) {
        transformedDto.contactInfo.countryId = new Types.ObjectId(
          updateCustomerSupportDto.contactInfo.countryId
        );
      }
    }

    if (updateCustomerSupportDto.upload) {
      transformedDto.upload = updateCustomerSupportDto.upload.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      }));
    }

    if (updateCustomerSupportDto.customerSupportFeatureRequest) {
      transformedDto.customerSupportFeatureRequest = {
        ...updateCustomerSupportDto.customerSupportFeatureRequest,
      };
      if (updateCustomerSupportDto.customerSupportFeatureRequest.documents) {
        transformedDto.customerSupportFeatureRequest.documents =
          updateCustomerSupportDto.customerSupportFeatureRequest.documents.map(
            (doc) => new Types.ObjectId(doc)
          );
      }
    }

    if (updateCustomerSupportDto.customerSupportErrorReport) {
      transformedDto.customerSupportErrorReport = {
        ...updateCustomerSupportDto.customerSupportErrorReport,
      };
      if (updateCustomerSupportDto.customerSupportErrorReport.documents) {
        transformedDto.customerSupportErrorReport.documents =
          updateCustomerSupportDto.customerSupportErrorReport.documents.map(
            (doc) => new Types.ObjectId(doc)
          );
      }
    }

    if (updateCustomerSupportDto.assignedTo) {
      transformedDto.assignedTo = updateCustomerSupportDto.assignedTo.map(
        (id) => new Types.ObjectId(id)
      );
    }

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

  async deleteCustomerSupport(customerSupportId: string) {
    const customerSupport = await this.customerSupportRepository.findById(customerSupportId);
    if (!customerSupport) {
      throw new NotFoundException(`Customer support with ID ${customerSupportId} not found`);
    }
    
    return await this.customerSupportRepository.update(customerSupportId, { isDeleted: true });
  }

  async updateCalendlyDetails(
    customerSupportId: string,
    updateCalendlyDetailsDto: UpdateCalendlyDetailsDto
  ): Promise<CustomerSupport> {
    const customerSupport = await this.customerSupportRepository.findById(customerSupportId);
    if (!customerSupport) {
      throw new NotFoundException(`Customer support with ID ${customerSupportId} not found`);
    }

    return this.customerSupportRepository.update(customerSupportId, {
      calendlyDetails: updateCalendlyDetailsDto
    });
  }
}
