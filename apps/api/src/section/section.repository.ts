import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section } from './schema/section.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class SectionRepository extends BaseRepository<Section> {
  constructor(@InjectModel(Section.name) private readonly sectionModel: Model<Section>) {
    super(sectionModel);
  }
}
