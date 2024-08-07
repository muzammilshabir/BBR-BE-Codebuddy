import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { AddUnitDto } from './dto/add-unit.dto';
import { Unit } from './schema/unit.schema';
import { Types } from 'mongoose';

@Injectable()
export class UnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async addUnit(addUnitDto: AddUnitDto, residenceId: string): Promise<Unit> {
    const transformedDto = {
      ...addUnitDto,
      residenceId: new Types.ObjectId(addUnitDto.residenceId),
    };
    return await this.unitRepository.create(transformedDto);
  }
}
