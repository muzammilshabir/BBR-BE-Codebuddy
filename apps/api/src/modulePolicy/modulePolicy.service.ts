import { Injectable } from '@nestjs/common';
import { ModulePolicyRepository } from './modulePolicy.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListModulePolicyDto } from './dto/listModulePolicy.dto';
import { CreateModulePolicyDto } from './dto/createModulePolicy.dto';
import { ModulePolicy } from './schema/modulePolicy.schema';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';
import { UpdateSectionDto } from './dto/updateModulePolicy.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class ModulePolicyService {
  constructor(private readonly modulePolicyRepository: ModulePolicyRepository) {}
  async findAll(listModulePolicyDto: ListModulePolicyDto) {
    const filter = {
      isDeleted: false,
      ...(listModulePolicyDto.search && {
        $or: [{ name: { $regex: listModulePolicyDto.search, $options: 'i' } }],
      }),
    };

    const options = PaginationService.prepareOptions(listModulePolicyDto);

    const { data, count } = await this.modulePolicyRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listModulePolicyDto);

    return { pagination, modulePolicy: data };
  }

  async create(
    createModulePolicyDto: CreateModulePolicyDto,
    userId: string
  ): Promise<ModulePolicy> {
    const slug = await this.generateSlug(createModulePolicyDto.name);
    const existingSection = await this.modulePolicyRepository.find({ slug });
    if (existingSection) {
      throw new BadRequestException(`A section with the slug "${slug}" already exists.`);
    }

    const modulePolicy = await this.modulePolicyRepository.create({
      ...createModulePolicyDto,
      slug,
      createdById: new Types.ObjectId(userId),
    });

    return modulePolicy;
  }

  async generateSlug(name: string): Promise<string> {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async update(
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
    userId: string
  ): Promise<ModulePolicy> {
    const section = await this.modulePolicyRepository.find({ _id: sectionId });
    if (!section) {
      throw new NotFoundException(`ModulePolicy with ID ${sectionId} not found`);
    }
    const updateSection: any = { ...updateSectionDto };

    // If name is being updated, generate a new slug
    if (updateSectionDto.name) {
      const slug = await this.generateSlug(updateSectionDto.name);
      const existingSection = await this.modulePolicyRepository.find({ slug });

      if (existingSection && existingSection._id.toString() !== sectionId) {
        throw new BadRequestException(`A ModulePolicy with the slug "${slug}" already exists.`);
      }

      updateSection.slug = slug;
    }

    const updatedmodulePolicy = await this.modulePolicyRepository.update(sectionId, {
      ...updateSection,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedmodulePolicy;
  }

  async deleteSection(sectionId: string, userId: string): Promise<ModulePolicy> {
    const section = await this.modulePolicyRepository.find({ _id: sectionId, isDeleted: false });
    if (!section) {
      throw new NotFoundException(`ModulePolicy with ID ${sectionId} not found`);
    }

    const modulePolicy = await this.modulePolicyRepository.update(sectionId, {
      isDeleted: DeletionStatus.DELETED,
      updatedById: new Types.ObjectId(userId),
    });
    return modulePolicy;
  }
}
