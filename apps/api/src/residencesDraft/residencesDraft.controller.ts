import { ApiTags } from '@nestjs/swagger';
import { ResidenceDraftService } from './residencesDraft.service';
import { Controller } from '@nestjs/common';

@ApiTags('ResidenceDraft')
@Controller('residence-draft')
export class ResidenceDraftController {
  constructor(private readonly residenceDraftService: ResidenceDraftService) {}
}
