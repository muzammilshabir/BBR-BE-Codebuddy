import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { AddUnitDto } from './dto/add-unit.dto';
import { Unit } from './schema/unit.schema';
import { Types } from 'mongoose';
import { AddUnitKeyFeaturesDto, ResidenceServiceDto } from './dto/unit-key-features.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListUnitDto } from './dto/list-unit.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { DeletionStatus, Recurrence, RoomType, ServiceType } from './enum/unit-enum';
import * as csv from 'csv-parser';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import { ResidenceService } from '../residences/residences.service';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly uploadService: UploadService,
    private readonly residenceService: ResidenceService
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

  async addVisuals(addVisualsDto: AddVisualsDto, unitId: string, userId: string): Promise<Unit> {
    const updatedUnit = await this.unitRepository.update(unitId, {
      visuals: addVisualsDto,
      updatedById: userId,
    });
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

  async processUploadedFile(residenceId: string, fileId: string, userId: string): Promise<any> {
    const fileDetails = await this.uploadService.getfileById(fileId);

    const tempFilePath = await this.uploadService.saveFileTemp(fileDetails?.fileKey);

    const fileBuffer = fs.readFileSync(tempFilePath);
    const fileStream = Readable.from(fileBuffer);
    let fileData: any[];

    try {
      if (fileDetails.mimeType === 'text/csv') {
        fileData = await new Promise((resolve, reject) => {
          const rows: any[] = [];
          fileStream
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', (error) => reject(error));
        });
      } else if (
        fileDetails.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        fileData = xlsx.utils.sheet_to_json(sheet);
      } else {
        throw new BadRequestException('Unsupported file format');
      }
    } finally {
      fs.unlinkSync(tempFilePath);
    }

    // Process and save file data
    return await this.saveFileData(fileData, residenceId, userId);
  }

  private normalizeString(str: string): string {
    return str.trim().toUpperCase().replace(/\s+/g, '_');
  }
  private parseResidenceServices(item: any): ResidenceServiceDto[] {
    const serviceTypes = item['Residence Services Type']?.split(',') || [];
    const amounts = item['Residence Services Amount']?.split(',') || [];
    const recurrences = item['Residence Services Recurrence']?.split(',') || [];

    return serviceTypes.map((serviceType: string, index: number) => ({
      serviceType: ServiceType[this.normalizeString(serviceType)],
      amount: amounts[index] ? Number(amounts[index]) : undefined,
      recurrence: recurrences[index]
        ? Recurrence[this.normalizeString(recurrences[index])]
        : undefined,
    }));
  }
  private async saveFileData(data: any[], residenceId: string, userId: string): Promise<Unit[]> {
    const addedUnits: Unit[] = [];
    await this.residenceService.getResidenceById(residenceId);

    for (const item of data) {
      const addUnitDto: AddUnitDto = {
        unitName: item['Unit Name'],
        specs: {
          unitNumber: item.Number ? item.Number : undefined,
          generalUnitSpaceSqFt: item['General Unit Space SqFt']
            ? Number(item['General Unit Space SqFt'])
            : undefined,
          floor: item.Floor ? Number(item.Floor) : undefined,
        },
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        exclusiveOffer: {
          exclusiveUnitPrice: item['Exclusive Unit Price']
            ? Number(item['Exclusive Unit Price'])
            : undefined,
          OfferStartDate: item['Exclusive Offer Start Date']
            ? new Date(item['Exclusive Offer Start Date'])
            : undefined,
          OfferEndDate: item['Exclusive Offer End Date']
            ? new Date(item['Exclusive Offer End Date'])
            : undefined,
        },
        rooms: item['Room Type']
          ? item['Room Type'].split(',').map((roomType, index) => ({
              roomType: RoomType[this.normalizeString(roomType)],
              unit: Number(item['Room Unit'].split(',')[index]),
            }))
          : undefined,
        briefOverview: {
          subTitle: item['Brief Overview SubTitle'],
          description: item['Brief Overview Description'],
        },
      };

      const unitDetails = await this.addUnit(addUnitDto, residenceId, userId);
      const unitId = unitDetails.id;

      const addUnitKeyFeaturesDto: AddUnitKeyFeaturesDto = {
        features: item['Unit Key Features'].split(',').map((feature: string) => feature.trim()),
        residenceServices: item['Residence Services Type']
          ? this.parseResidenceServices(item)
          : undefined,
      };
      await this.addUnitKeyFeatures(addUnitKeyFeaturesDto, unitId);

      const addVisualsDto: AddVisualsDto = {
        mainPhotos: [],
        mainGalleryPhotos: [],
        secondGalleryPhotos: [],
        videoTour: null,
      };

      const mainGalleryUrls = item['Main Gallery Photos'].split(',');
      for (const url of mainGalleryUrls) {
        const fileMetadata: any = await this.uploadService.downloadFile(url, userId);
        addVisualsDto.mainGalleryPhotos.push(fileMetadata?._id);
      }

      if (item['Second Gallery Photos']) {
        const secondGalleryUrls = item['Second Gallery Photos'].split(',');
        for (const url of secondGalleryUrls) {
          const fileMetadata: any = await this.uploadService.downloadFile(url, userId);
          if (fileMetadata?._id) {
            addVisualsDto.secondGalleryPhotos.push(fileMetadata._id);
          }
        }
      }

      if (item['Main Photos']) {
        const mainPhotosUrls = item['Main Photos'].split(',');
        for (const url of mainPhotosUrls) {
          const fileMetadata: any = await this.uploadService.downloadFile(url, userId);
          if (fileMetadata?._id) {
            addVisualsDto.mainPhotos.push(fileMetadata._id);
          }
        }
      }

      if (item['Video Tour']) {
        const fileMetadata: any = await this.uploadService.downloadFile(item['Video Tour'], userId);
        if (fileMetadata?._id) {
          addVisualsDto.videoTour = fileMetadata._id;
        }
      }

      if (item['Video Tour Link']) {
        addVisualsDto.videoTourLink = item['Video Tour Link'];
      }

      const unit = await this.addVisuals(addVisualsDto, unitId, userId);
      addedUnits.push(unit);
    }

    return addedUnits;
  }
}
