import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ResidenceRepository } from './residences.repository';
import { CreateResidenceDto } from './dto/create-residence.dto';
import { Residence } from './schema/residences.schema';
import { UpdateResidenceDto } from './dto/update-residence.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../../../packages/api-core/modules/exceptions';

@Injectable()
export class ResidenceService {
  constructor(private readonly residenceRepository: ResidenceRepository) {}

  async create(createResidenceDto: CreateResidenceDto): Promise<Residence> {
    return await this.residenceRepository.create(createResidenceDto);
  }

  async update(id: string, updateResidenceDto: UpdateResidenceDto): Promise<Residence> {
    try {
      const existingResidence = await this.residenceRepository.update(id, updateResidenceDto);
      if (!existingResidence) {
        throw new NotFoundException(`Residence with ID ${id} not found`);
      }
      return existingResidence;
    } catch (error) {
      if (error.response && error.response.statusCode === 400) {
        throw new BadRequestException(error.response.message);
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
