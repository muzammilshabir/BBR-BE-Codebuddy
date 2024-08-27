import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';

@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}
}
