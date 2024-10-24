import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrandDraftService } from './brandDraft.service';

@ApiTags('BrandDraft')
@Controller('brand-draft')
export class BrandDraftController {
  constructor(private readonly brandDraftService: BrandDraftService) {}
}
