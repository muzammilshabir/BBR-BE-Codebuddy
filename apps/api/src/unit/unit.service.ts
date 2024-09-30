import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UnitRepository } from './unit.repository';
import { AddUnitDto } from './dto/add-unit.dto';
import { Unit } from './schema/unit.schema';
import { Types } from 'mongoose';
import { AddUnitKeyFeaturesDto, ResidenceServiceDto } from './dto/unit-key-features.dto';
import { AddVisualsDto } from './dto/add-visuals.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { ListUnitDto } from './dto/list-unit.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { DeletionStatus, Recurrence } from './enum/unit-enum';
import * as csv from 'csv-parser';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import { ResidenceService } from '../residences/residences.service';
import { RoomTypeRepository } from '../roomType/roomType.repository';
import { ResidenceServiceRepository } from '../residenceService/residenceService.repository';
import { UnitDraftRepository } from '../unitDraft/unitDraft.repository';
import { ResidenceStatus } from '../residences/enum/residence-enum';
import { UnitDraft } from '../unitDraft/schema/unitDraft.schema';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  private readonly logger = new Logger(UnitService.name);
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly uploadService: UploadService,
    private readonly residenceService: ResidenceService,
    private readonly roomTypeRepository: RoomTypeRepository,
    private readonly residenceServiceRepository: ResidenceServiceRepository,
    private readonly unitDraftRepository: UnitDraftRepository
  ) {}

  async addUnit(addUnitDto: AddUnitDto, residenceId: string, userId: string): Promise<UnitDraft> {
    try {
      // Check if the residence is rejected
      await this.residenceService.checkResidenceRejectedStatus(residenceId);

      const transformedDto = {
        ...addUnitDto,
        residenceId: new Types.ObjectId(residenceId),
        createdById: new Types.ObjectId(userId),
        status: ResidenceStatus.DRAFT,
      };

      // Create unit and unit draft
      const unit = await this.unitRepository.create(transformedDto);
      const unitDraft = await this.unitDraftRepository.create({
        unitId: unit._id,
        ...transformedDto,
      });

      // Check and handle residence drafts
      await this.checkAndHandleResidenceDraft(residenceId);

      return unitDraft;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create unit draft', error);
    }
  }

  async checkAndHandleResidenceDraft(residenceId: string): Promise<void> {
    const existingDraftResidence = await this.residenceService.checkResidenceDraft(residenceId);

    if (existingDraftResidence && existingDraftResidence.status === ResidenceStatus.PENDING) {
      await this.residenceService.updateResidenceToDraft(residenceId, existingDraftResidence.id);
    }

    if (!existingDraftResidence) {
      await this.residenceService.createDraftForResidence(residenceId);
    }
  }

  async checkUnitDraft(unitId: string): Promise<UnitDraft | null> {
    return await this.unitDraftRepository.find({
      unitId: new Types.ObjectId(unitId),
      status: { $in: [ResidenceStatus.DRAFT, ResidenceStatus.PENDING] },
    });
  }

  async addUnitKeyFeatures(
    addUnitKeyFeaturesDto: AddUnitKeyFeaturesDto,
    unitId: string,
    userId: string
  ): Promise<UnitDraft> {
    const existingUnit = await this.unitRepository.findById(unitId);
    if (!existingUnit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }
    const residenceId = existingUnit.residenceId.toString();

    await this.residenceService.checkResidenceRejectedStatus(residenceId);

    const existingUnitDraft = await this.checkUnitDraft(unitId);
    if (existingUnitDraft) {
      return await this.unitDraftRepository.update(existingUnitDraft.id, {
        unitKeyFeatures: addUnitKeyFeaturesDto,
        updatedById: new Types.ObjectId(userId),
        status: ResidenceStatus.DRAFT,
      });
    }

    const plainUnit = existingUnit.toJSON();
    delete plainUnit._id;
    delete plainUnit.status;

    const unitDraft = await this.unitDraftRepository.create({
      unitId: new Types.ObjectId(unitId),
      unitKeyFeatures: addUnitKeyFeaturesDto,
      updatedById: new Types.ObjectId(userId),
      status: ResidenceStatus.DRAFT,
      ...plainUnit,
    });

    await this.checkAndHandleResidenceDraft(residenceId);

    return unitDraft;
  }

  async addVisuals(
    addVisualsDto: AddVisualsDto,
    unitId: string,
    userId: string
  ): Promise<UnitDraft> {
    const existingUnit = await this.unitRepository.findById(unitId);
    if (!existingUnit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }
    const residenceId = existingUnit.residenceId.toString();

    await this.residenceService.checkResidenceRejectedStatus(residenceId);

    const existingUnitDraft = await this.checkUnitDraft(unitId);
    if (existingUnitDraft) {
      return await this.unitDraftRepository.update(existingUnitDraft.id, {
        visuals: addVisualsDto,
        updatedById: new Types.ObjectId(userId),
        status: ResidenceStatus.DRAFT,
      });
    }

    const plainUnit = existingUnit.toJSON();
    delete plainUnit._id;
    delete plainUnit.status;

    const unitDraft = await this.unitDraftRepository.create({
      unitId: new Types.ObjectId(unitId),
      visuals: addVisualsDto,
      updatedById: new Types.ObjectId(userId),
      status: ResidenceStatus.DRAFT,
      ...plainUnit,
    });

    await this.checkAndHandleResidenceDraft(residenceId);

    return unitDraft;
  }

  async getUnitById(unitId: string): Promise<Unit> {
    const unitDetails = await this.unitRepository.findByIdInDetail(unitId);
    if (!unitDetails) {
      throw new NotFoundException(`Unit with ID ${unitId}`);
    }
    return unitDetails;
  }

  async updateUnit(
    unitId: string,
    updateUnitDto: UpdateUnitDto,
    userId: string
  ): Promise<UnitDraft> {
    const existingUnit = await this.unitRepository.findById(unitId);
    if (!existingUnit) {
      throw new NotFoundException(`Unit with ID ${unitId} not found`);
    }

    const residenceId = existingUnit.residenceId.toString();
    await this.residenceService.checkResidenceRejectedStatus(residenceId);

    const existingUnitDraft = await this.checkUnitDraft(unitId);
    if (existingUnitDraft) {
      return await this.unitDraftRepository.update(existingUnitDraft.id, {
        ...updateUnitDto,
        updatedById: new Types.ObjectId(userId),
        status: ResidenceStatus.DRAFT,
      });
    }

    const plainUnit = existingUnit.toJSON();
    delete plainUnit._id;
    delete plainUnit.status;

    const unitDraft = await this.unitDraftRepository.create({
      unitId: new Types.ObjectId(unitId),
      updatedById: new Types.ObjectId(userId),
      status: ResidenceStatus.DRAFT,
      ...plainUnit,
      ...updateUnitDto,
    });

    await this.checkAndHandleResidenceDraft(residenceId);

    return unitDraft;
  }

  async listUnits(listUnitDto: ListUnitDto) {
    const filter: any = { isDeleted: DeletionStatus.ACTIVE };

    if (listUnitDto.residenceId) {
      filter.residenceId = new Types.ObjectId(listUnitDto.residenceId);
    }

    if (listUnitDto.status) {
      filter.status = listUnitDto.status;
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

  private async parseResidenceServices(
    item: any
  ): Promise<{ data: ResidenceServiceDto[]; errors: string[] }> {
    const errors: string[] = [];
    const serviceTypes = item['Residence Services Type']?.split(',') || [];
    const amounts = item['Residence Services Amount']?.split(',') || [];
    const recurrences = item['Residence Services Recurrence']?.split(',') || [];

    const serviceTypeIds = await Promise.all(
      serviceTypes.map(async (serviceType) => {
        try {
          const service = await this.residenceServiceRepository.findByService(serviceType);
          if (!service) {
            throw new Error(`Service Type ${serviceType} not found in database.`);
          }
          return service._id;
        } catch (error) {
          errors.push(error.message);
        }
      })
    );

    return {
      data: serviceTypeIds.map((serviceTypeId, index) => ({
        serviceTypeId,
        amount: amounts[index] ? Number(amounts[index]) : undefined,
        recurrence: recurrences[index]
          ? Recurrence[this.normalizeString(recurrences[index])]
          : undefined,
      })),
      errors,
    };
  }

  private async saveFileData(
    data: any[],
    residenceId: string,
    userId: string
  ): Promise<{ addedUnits: Unit[]; failedToAdd: { unitName: string; errors: string[] }[] }> {
    const addedUnits: Unit[] = [];
    const failedToAdd: { unitName: string; errors: string[] }[] = [];

    await this.residenceService.getResidenceById(residenceId);

    for (const item of data) {
      const errors: string[] = [];
      let roomDetails: { roomTypeId: Types.ObjectId; unit: number }[] = [];

      if (item['Room Type']) {
        const roomTypes = item['Room Type'].split(',');
        const roomUnits = item['Room Unit'] ? item['Room Unit'].split(',') : [];

        // Fetch roomTypeIds asynchronously
        roomDetails = await Promise.all(
          roomTypes.map(async (roomType, index) => {
            const roomTypeDoc = await this.roomTypeRepository.findByType(roomType);

            if (!roomTypeDoc) {
              errors.push(`Room Type ${roomType} not found in database.`);
              this.logger.error(`Room Type ${roomType} not found in database.`);
            }

            return {
              roomTypeId: roomTypeDoc ? (roomTypeDoc._id as Types.ObjectId) : undefined,
              unit: roomUnits[index] ? Number(roomUnits[index]) : undefined,
            };
          })
        );
      }

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
        rooms: roomDetails.length ? roomDetails : undefined,
        briefOverview: {
          subTitle: item['Brief Overview SubTitle'],
          description: item['Brief Overview Description'],
        },
      };
      const unitDetails = await this.addUnit(addUnitDto, residenceId, userId);
      const unitId = unitDetails.unitId.toString();

      const residenceServicesResult = item['Residence Services Type']
        ? await this.parseResidenceServices(item)
        : { data: [], errors: [] };

      const addUnitKeyFeaturesDto: AddUnitKeyFeaturesDto = {
        features: item['Unit Key Features'].split(',').map((feature: string) => feature.trim()),
        residenceServices: residenceServicesResult.data,
      };

      if (residenceServicesResult.errors.length > 0) {
        failedToAdd.push({
          unitName: item['Unit Name'],
          errors: residenceServicesResult.errors,
        });
      }
      await this.addUnitKeyFeatures(addUnitKeyFeaturesDto, unitId, userId);

      const addVisualsDto: AddVisualsDto = {
        mainPhotos: [],
        mainGalleryPhotos: [],
        secondGalleryPhotos: [],
        videoTour: null,
      };

      const mainGalleryUrls = item['Main Gallery Photos'].split(',');
      for (const url of mainGalleryUrls) {
        const { fileMetadata, error } = await this.uploadService.downloadFile(url, userId);
        if (error) {
          failedToAdd.push({
            unitName: item['Unit Name'],
            errors: [error],
          });
        } else if (fileMetadata) {
          addVisualsDto.mainGalleryPhotos.push(fileMetadata?._id);
        }
      }

      if (item['Second Gallery Photos']) {
        const secondGalleryUrls = item['Second Gallery Photos'].split(',');
        for (const url of secondGalleryUrls) {
          const { fileMetadata, error } = await this.uploadService.downloadFile(url, userId);
          if (error) {
            failedToAdd.push({
              unitName: item['Unit Name'],
              errors: [error],
            });
          } else if (fileMetadata) {
            addVisualsDto.secondGalleryPhotos.push(fileMetadata._id);
          }
        }
      }

      if (item['Main Photos']) {
        const mainPhotosUrls = item['Main Photos'].split(',');
        for (const url of mainPhotosUrls) {
          const { fileMetadata, error } = await this.uploadService.downloadFile(url, userId);
          if (error) {
            failedToAdd.push({
              unitName: item['Unit Name'],
              errors: [error],
            });
          } else if (fileMetadata) {
            addVisualsDto.mainPhotos.push(fileMetadata._id);
          }
        }
      }

      if (item['Video Tour']) {
        const { fileMetadata, error } = await this.uploadService.downloadFile(
          item['Video Tour'],
          userId
        );
        if (error) {
          failedToAdd.push({
            unitName: item['Unit Name'],
            errors: [error],
          });
        } else if (fileMetadata) {
          addVisualsDto.videoTour = fileMetadata._id;
        }
      }

      if (item['Video Tour Link']) {
        addVisualsDto.videoTourLink = item['Video Tour Link'];
      }

      const unit = await this.addVisuals(addVisualsDto, unitId, userId);
      addedUnits.push(unit);
      if (errors.length > 0) {
        failedToAdd.push({
          unitName: item['Unit Name'],
          errors: errors,
        });
      }
    }

    return { addedUnits, failedToAdd };
  }

  async listUnitsWithDraft(listUnitDto: ListUnitDto) {
    const result = await this.unitRepository.listUnitsWithDraft(listUnitDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUnitDto);

    return { pagination, unit: data };
  }
}
