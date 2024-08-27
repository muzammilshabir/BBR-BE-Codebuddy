import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeographicalAreasService } from './geographicalAreas.service';

@ApiTags('GeographicalAreas')
@Controller('geographical-areas')
export class GeographicalAreasController {
  constructor(private readonly geographicalAreasService: GeographicalAreasService) {}
}
