import { Injectable } from '@nestjs/common';
import { ResidenceEnquiryRepository } from './residenceEnquiry.repository';
import { ListResidenceEnquiryDto } from './dto/list-residenceEnquiry.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { AddResidenceEnquiryDto } from './dto/add-residenceEnquiry.dto';
import { ResidenceEnquiry } from './schema/residenceEnquiry.schema';
import { Types } from 'mongoose';

@Injectable()
export class ResidenceEnquiryService {
  constructor(private readonly residenceEnquiryRepository: ResidenceEnquiryRepository) {}

  async addResidenceEnquiry(
    addResidenceEnquiryDto: AddResidenceEnquiryDto
  ): Promise<ResidenceEnquiry> {
    const transformedDto = {
      ...addResidenceEnquiryDto,
      residenceId: addResidenceEnquiryDto.residenceId
        ? new Types.ObjectId(addResidenceEnquiryDto.residenceId)
        : undefined,
      unitId: addResidenceEnquiryDto.unitId
        ? new Types.ObjectId(addResidenceEnquiryDto.unitId)
        : undefined,
      userId: addResidenceEnquiryDto.userId
        ? new Types.ObjectId(addResidenceEnquiryDto.userId)
        : undefined,
    };
    return await this.residenceEnquiryRepository.create(transformedDto);
  }

  async findAll(listResidenceEnquiryDto: ListResidenceEnquiryDto) {
    const filter = listResidenceEnquiryDto.search
      ? {
          $or: [{ name: { $regex: listResidenceEnquiryDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listResidenceEnquiryDto);

    const { data, count } = await this.residenceEnquiryRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listResidenceEnquiryDto
    );

    return { pagination, residenceEnquirys: data };
  }
}
