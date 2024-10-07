import { Injectable } from '@nestjs/common';
import { SectionRepository } from './section.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListSectionDto } from './dto/listSection.dto';
import { CreateSectionDto } from './dto/createSection.dto';
import { Section } from './schema/section.schema';
import { BadRequestException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';

@Injectable()
export class SectionService {
  constructor(private readonly sectionRepository: SectionRepository) {}
  async findAll(listSectionDto: ListSectionDto) {
    const filter = listSectionDto.search
      ? {
          $or: [{ name: { $regex: listSectionDto.search, $options: 'i' } }],
        }
      : {};

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
}
