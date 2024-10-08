import { Injectable } from '@nestjs/common';
import { SectionRepository } from './section.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListSectionDto } from './dto/listSection.dto';
import { CreateSectionDto } from './dto/createSection.dto';
import { Section } from './schema/section.schema';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';
import { UpdateSectionDto } from './dto/updateSection.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';

@Injectable()
export class SectionService {
  constructor(private readonly sectionRepository: SectionRepository) {}
  async findAll(listSectionDto: ListSectionDto) {
    const filter = {
      isDeleted: false,
      ...(listSectionDto.search && {
        $or: [{ name: { $regex: listSectionDto.search, $options: 'i' } }],
      }),
    };

    const options = PaginationService.prepareOptions(listSectionDto);

    const { data, count } = await this.sectionRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listSectionDto);

    return { pagination, residenceServiceType: data };
  }

  async create(createSectionDto: CreateSectionDto, userId: string): Promise<Section> {
    const slug = await this.generateSlug(createSectionDto.name);
    const existingSection = await this.sectionRepository.find({ slug });
    if (existingSection) {
      throw new BadRequestException(`A section with the slug "${slug}" already exists.`);
    }

    const section = await this.sectionRepository.create({
      ...createSectionDto,
      slug,
      createdById: new Types.ObjectId(userId),
    });

    return section;
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
  ): Promise<Section> {
    const section = await this.sectionRepository.find({ _id: sectionId });
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }
    const updateSection: any = { ...updateSectionDto };

    // If name is being updated, generate a new slug
    if (updateSectionDto.name) {
      const slug = await this.generateSlug(updateSectionDto.name);
      const existingSection = await this.sectionRepository.find({ slug });

      if (existingSection && existingSection._id.toString() !== sectionId) {
        throw new BadRequestException(`A section with the slug "${slug}" already exists.`);
      }

      updateSection.slug = slug;
    }

    const updatedSection = await this.sectionRepository.update(sectionId, {
      ...updateSection,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedSection;
  }

  async deleteSection(sectionId: string, userId: string): Promise<Section> {
    const section = await this.sectionRepository.find({ _id: sectionId, isDeleted: false });
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    const updatedSection = await this.sectionRepository.update(sectionId, {
      isDeleted: DeletionStatus.DELETED,
      updatedById: new Types.ObjectId(userId),
    });
    return updatedSection;
  }
}
