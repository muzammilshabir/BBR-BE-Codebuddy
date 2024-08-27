import { Injectable } from '@nestjs/common';
import { CityRepository } from './city.repository';

@Injectable()
export class CityService {
  constructor(private readonly cityRepository: CityRepository) {}
}
