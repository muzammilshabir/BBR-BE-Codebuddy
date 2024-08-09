import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { AddUnitDto } from './dto/add-unit.dto';
import { Unit } from './schema/unit.schema';
import { Types } from 'mongoose';
import { AddUnitKeyFeaturesDto, ResidenceServiceDto } from './dto/unit-key-features.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';
import {
  BadRequestException,
  NotFoundException,
} from '../../../../packages/api-core/modules/exceptions';
import { ListUnitDto } from './dto/list-unit.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { DeletionStatus, Recurrence, RoomType, ServiceType } from './enum/unit-enum';
import * as csv from 'csv-parser'; // Add relevant libraries for file parsing
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly uploadService: UploadService
  ) {}

  async addUnit(addUnitDto: AddUnitDto, residenceId: string, userId: string): Promise<Unit> {
    const transformedDto = {
      ...addUnitDto,
      residenceId: new Types.ObjectId(residenceId),
      userId: new Types.ObjectId(userId),
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
    const filter: any = { isDeleted: DeletionStatus.ACTIVE };

    if (listUnitDto.residenceId) {
      filter.residenceId = new Types.ObjectId(listUnitDto.residenceId);
    }
    const options = PaginationService.prepareOptions(listUnitDto);

    const { data, count } = await this.unitRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUnitDto);

    return { pagination, units: data };
  }

  async deleteUnit(unitId: string): Promise<Unit> {
    const updatedUnit = await this.unitRepository.update(unitId, {
      isDeleted: DeletionStatus.DELETED,
    });
    if (!updatedUnit) {
      throw new NotFoundException(`Unit with ID ${unitId}`);
    }
    return updatedUnit;
  }

  async processUploadedFile(file: Express.Multer.File, residenceId: string, userId: string) {
    if (!file || !residenceId) {
      throw new BadRequestException('Invalid file or residence ID');
    }

    let fileData;
    const fileStream = Readable.from(file.buffer);

    if (file.mimetype === 'text/csv') {
      fileData = [];
      fileStream
        .pipe(csv())
        .on('data', (row) => fileData.push(row))
        .on('end', async () => {
          // Process and save file data
          await this.saveFileData(fileData, residenceId, userId);
        });
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      fileData = xlsx.utils.sheet_to_json(sheet);
      console.log('fileData excel :>> ', fileData);
      await this.saveFileData(fileData, residenceId, userId);
    } else {
      throw new BadRequestException('Unsupported file format');
    }

    return { message: 'File processed successfully' };
  }

  private normalizeString(str: string): string {
    return str.trim().toUpperCase().replace(/\s+/g, '_');
  }
  private parseResidenceServices(item: any): ResidenceServiceDto[] {
    const serviceTypes = item['unitKeyFeatures.residenceServices.serviceType']?.split(',') || [];
    const amounts = item['unitKeyFeatures.residenceServices.amount']?.split(',') || [];
    const recurrences = item['unitKeyFeatures.residenceServices.recurrence']?.split(',') || [];

    return serviceTypes.map((serviceType: string, index: number) => ({
      serviceType: ServiceType[this.normalizeString(serviceType)],
      amount: Number(amounts[index]),
      recurrence: Recurrence[this.normalizeString(recurrences[index])],
    }));
  }
  private async saveFileData(data: any[], residenceId: string, userId: string) {
    for (const item of data) {
      const addUnitDto: AddUnitDto = {
        unitName: item.unitName,
        specs: {
          unitNumber: item['specs.unitNumber'],
          generalUnitSpaceSqFt: Number(item['specs.generalUnitSpaceSqFt']),
          floor: Number(item['specs.floor']),
        },
        unitPrice: Number(item.unitPrice),
        exclusiveOffer: {
          exclusiveUnitPrice: Number(item['exclusiveOffer.exclusiveUnitPrice']),
          OfferStartDate: new Date(item['exclusiveOffer.OfferStartDate']),
          OfferEndDate: new Date(item['exclusiveOffer.OfferEndDate']),
        },
        rooms: item['rooms.roomType'].split(',').map((roomType, index) => ({
          roomType: RoomType[this.normalizeString(roomType)],
          unit: Number(item['rooms.unit'].split(',')[index]),
        })),
        briefOverview: {
          subTitle: item['briefOverview.subTitle'],
          description: item['briefOverview.description'],
        },
      };
      // Call the addUnit service method
      const unitDetails = await this.addUnit(addUnitDto, residenceId, userId);
      const unitId = unitDetails._id.toString(); // Assuming _id is an ObjectId
      console.log('unitId :>> ', unitId);

      // Construct the AddUnitKeyFeaturesDto object
      const addUnitKeyFeaturesDto: AddUnitKeyFeaturesDto = {
        features: item['unitKeyFeatures.features']
          .split(',')
          .map((feature: string) => feature.trim()),

        residenceServices: this.parseResidenceServices(item),
      };
      await this.addUnitKeyFeatures(addUnitKeyFeaturesDto, unitId);

      // Initialize the AddVisualsDto object
      const addVisualsDto: AddVisualsDto = {
        mainGalleryPhotos: [],
        secondGalleryPhotos: [],
        videoTour: null,
      };

      const mainGalleryUrls = item['visuals.mainGalleryPhotos'].split(',');
      for (const url of mainGalleryUrls) {
        const fileMetadata: any = await this.uploadService.downloadFile(url, userId);
        addVisualsDto.mainGalleryPhotos.push(fileMetadata?._id);
      }

      if (item['visuals.secondGalleryPhotos']) {
        const secondGalleryUrls = item['visuals.secondGalleryPhotos'].split(',');
        for (const url of secondGalleryUrls) {
          const fileMetadata: any = await this.uploadService.downloadFile(url, userId);
          if (fileMetadata?._id) {
            addVisualsDto.secondGalleryPhotos.push(fileMetadata._id);
          }
        }
      }
      if (item['visuals.videoTour']) {
        const fileMetadata: any = await this.uploadService.downloadFile(
          item['visuals.videoTour'],
          userId
        );
        if (fileMetadata?._id) {
          addVisualsDto.videoTour = fileMetadata._id;
        }
      }
      if (item['visuals.videoTourLink']) {
        addVisualsDto.videoTourLink = item['visuals.videoTourLink'];
      }

      await this.addVisuals(addVisualsDto, unitId);
    }
  }
}
