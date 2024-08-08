import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { AddUnitDto } from './dto/add-unit.dto';
import { Unit } from './schema/unit.schema';
import { Types } from 'mongoose';
import { AddUnitKeyFeaturesDto } from './dto/unit-key-features.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';
import { NotFoundException } from '../../../../packages/api-core/modules/exceptions';
import { ListUnitDto } from './dto/list-unit.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';

@Injectable()
export class UnitService {
  constructor(private readonly unitRepository: UnitRepository) {}

  async addUnit(addUnitDto: AddUnitDto, residenceId: string): Promise<Unit> {
    const transformedDto = {
      ...addUnitDto,
      residenceId: new Types.ObjectId(residenceId),
    };
    return await this.unitRepository.create(transformedDto);
  }

  async addUnitKeyFeatures(
    addUnitKeyFeaturesDto: AddUnitKeyFeaturesDto,
    unitId: string
  ): Promise<Unit> {
    const updatedUnit = await this.unitRepository.update(unitId, {
      unitKeyFeatures: addUnitKeyFeaturesDto,
    });
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }
    return updatedUnit;
  }

  async addVisuals(addVisualsDto: AddVisualsDto, unitId: string): Promise<Unit> {
    const updatedUnit = await this.unitRepository.update(unitId, { visuals: addVisualsDto });
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }
    return updatedUnit;
  }

  async getUnitById(unitId: string): Promise<Unit> {
    const unitDetails = await this.unitRepository.findById(unitId);
    if (!unitDetails) {
      throw new NotFoundException(`Unit with ID ${unitId}`);
    }
    return unitDetails;
  }

  async listUnits(listUnitDto: ListUnitDto) {
    const filter: any = {};

    if (listUnitDto.residenceId) {
      filter.residenceId = new Types.ObjectId(listUnitDto.residenceId);
    }
    const options = PaginationService.prepareOptions(listUnitDto);

    const { data, count } = await this.unitRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUnitDto);

    return { pagination, units: data };
  }
}
