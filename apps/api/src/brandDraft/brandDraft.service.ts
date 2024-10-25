import { Injectable } from '@nestjs/common';
import { BrandDraftRepository } from './brandDraft.repository';
import { ListBrandDto } from '../brand/dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class BrandDraftService {
  constructor(private readonly brandDraftRepository: BrandDraftRepository) {}
  async getBrandDraftById(brandDraftId: string) {
    return await this.brandDraftRepository.getBrandDraftById(brandDraftId);
  }

  async getLatestBrandDraftsWithResidenceCount(listBrandDto: ListBrandDto) {
    const result =
      await this.brandDraftRepository.getLatestBrandDraftsWithResidenceCount(listBrandDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

    return { pagination, brand: data };
  }
}
