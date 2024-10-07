import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SectionService } from './section.service';

@ApiTags('Section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}
}
