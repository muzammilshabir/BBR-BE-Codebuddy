import { Injectable } from '@nestjs/common';
import { SectionRepository } from './section.repository';

@Injectable()
export class SectionService {
  constructor(private readonly sectionRepository: SectionRepository) {}
}
