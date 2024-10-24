import { Injectable } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { ListBrandDto } from './dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateBrandDto } from './dto/updateBrand.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { CreateBrandDraftDto } from './dto/createBrandDraft.dto';
import { BrandDraftRepository } from '../brandDraft/brandDraft.repository';
import { BrandStatus } from './enum/brand-enum';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandDraftRepository: BrandDraftRepository
  ) {}

  async findAll(listBrandDto: ListBrandDto) {
    const filter = listBrandDto.search
      ? {
          $or: [{ name: { $regex: listBrandDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(listBrandDto);

    const { data, count } = await this.brandRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

    return { pagination, brands: data };
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    return await this.brandRepository.update(id, updateBrandDto);
  }

  async saveAsDraft(createBrandDraftDto: CreateBrandDraftDto) {
    const { brandId, name, description, brandCategoryId, upload, registeredDate } =
      createBrandDraftDto;

    // If brandId does not exist, create a new brand
    if (!brandId) {
      const newBrand = await this.brandRepository.create({
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.DRAFT, // New brand is saved as draft
        registeredDate,
      });

      // Create a draft associated with the new brand
      const brandDraft = await this.brandDraftRepository.create({
        brandId: newBrand._id,
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.DRAFT,
        registeredDate,
      });

      return brandDraft;
    }

    const existingBrand: any = await this.brandRepository.findById(brandId);
    if (!existingBrand) {
      throw new NotFoundException(`Brand with id ${brandId} not found`);
    }

    // If brandId exists, check for an existing open draft
    const existingDraft: any = await this.brandDraftRepository.find({
      brandId: new Types.ObjectId(brandId),
      status: BrandStatus.DRAFT,
    });

    if (existingDraft) {
      // Update the existing draft with the new data
      const updatePayload: any = {
        name,
        description,
        upload,
        registeredDate,
      };

      // Only update brandCategoryId if it's provided
      if (brandCategoryId) {
        updatePayload.brandCategoryId = new Types.ObjectId(brandCategoryId);
      }

      const updatedDraft = await this.brandDraftRepository.update(existingDraft._id, updatePayload);

      return updatedDraft;
    }

    // If no open draft exists, create a new draft for the brand
    const newDraft = await this.brandDraftRepository.create({
      brandId: new Types.ObjectId(brandId),
      name,
      description,
      brandCategoryId: new Types.ObjectId(brandCategoryId),
      upload,
      status: BrandStatus.DRAFT,
      registeredDate,
    });

    return newDraft;
  }
}
