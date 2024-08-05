import { Injectable } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';

@Injectable()
export class ResidenceService {
  constructor(private readonly residenceRepository: ResidenceRepository) {}


  async create(createResidenceDto: CreateResidenceDto): Promise<Residence>  {
    return await this.residenceRepository.create(createResidenceDto);
  }
}