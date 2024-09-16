import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UnitDraftService } from './unitDraft.service';

@ApiTags('UnitDraft')
@Controller('unit-draft')
export class UnitDraftController {
  constructor(private readonly unitDraftService: UnitDraftService) {}
}
