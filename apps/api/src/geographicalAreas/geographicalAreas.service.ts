import { Injectable } from '@nestjs/common';
import { GeographicalAreasRepository } from './geographicalAreas.repository';

@Injectable()
export class GeographicalAreasService {
  constructor(private readonly geographicalAreasRepository: GeographicalAreasRepository) {}
}
