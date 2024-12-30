import { ResidenceActivityLogRepository } from './../residence-activity-log/residence-activity-log.repository';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingRequestRepository } from './rankingRequest.repository';
import { CreateRankingRequestDto } from './dto/create-ranking-request.dto';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingRequest } from './schema/rankingRequest.schema';
import { RankingRequestStatus } from './enum/rankingRequest-status.enum';
import {
  UpdateRankingRequestDto,
  UpdateRankingRequestStatusDto,
} from './dto/update-ranking-request.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';
import {
  ListTop10RankedResidenceDto,
  ListRankingRequestWithDraftDto,
  ListRankingRequestDto,
  ListRankingRequestForUserDto,
} from './dto/list-ranking-request.dto';
import { RejectRankingRequestDto } from './dto/reject-ranking-request.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { RankingRequestDraftRepository } from '../rankingRequestDraft/rankingRequestDraft.repository';
import { UserRepository } from '../users/user.repository';
import { ResidenceRepository } from '../residences/residences.repository';
import { RankingCategoryRepository } from '../rankingCategory/rankingCategory.repository';
import { PaymentStatus } from './enum/payment-status.enum';
import { ImproveRankingRequestDto } from './dto/improve-ranking-request.dto ';
import { RankingCategoryStatus } from '../rankingCategory/enum/rankingCategory-status.enum';
import { ResidenceStatus } from '../residences/enum/residence-enum';
import { UserRole } from '../users/enum/user.enum';
import * as XLSX from 'xlsx';
import { format } from '@fast-csv/format';
import { Writable } from 'stream';
import { ChangeRankingScore } from './enum/change-ranking-score.enum';

@Injectable()
export class RankingRequestService {
  constructor(
    private readonly rankingRequestRepository: RankingRequestRepository,
    private readonly rankingRequestDraftRepository: RankingRequestDraftRepository,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly residenceActivityLogRepository: ResidenceActivityLogRepository
  ) {}

  async findAll(listRankingRequestDto: ListRankingRequestDto) {
    const result = await this.rankingRequestRepository.findAllRankingRequest(listRankingRequestDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const updatedData = [];

    const map: Map<string, RankingRequest[]> = new Map();
    for (let index = 0; index < data?.length; index++) {
      const rankingRequest = data[index];

      const rankingRequests = map.get(rankingRequest.rankingCategoryId.toString());
      let position = 0;
      if (rankingRequests && rankingRequests.length > 0) {
        position = await this.getCurrentPosition(rankingRequests, rankingRequest?._id.toString());
      } else {
        const newRankingRequests = await this.rankingRequestRepository.findAll(
          {
            rankingCategoryId: rankingRequest?.rankingCategoryId,
            isDeleted: { $ne: DeletionStatus.DELETED },
            bbrScore: { $exists: true },
            status: {
              $in: [
                RankingCategoryStatus.ACTIVE,
                RankingCategoryStatus.DRAFT,
                RankingCategoryStatus.PENDING,
              ],
            },
          },
          {
            sort: {
              'bbrScore': -1,
            },
          }
        );
        position = await this.getCurrentPosition(
          newRankingRequests.data,
          rankingRequest?._id.toString()
        );

        map.set(rankingRequest.rankingCategoryId.toString(), newRankingRequests.data);
      }
      updatedData.push({
        ...rankingRequest,
        position,
      });
    }

    const { pagination } = PaginationService.paginate({ rows: data, count }, listRankingRequestDto);
    return { pagination, rankingRequests: updatedData };
  }

  async findAllRankingRequestForUser(listRankingRequestForUserDto: ListRankingRequestForUserDto) {
    const result = await this.rankingRequestRepository.findAllRankingRequestForUser(
      listRankingRequestForUserDto
    );
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];
    const updatedData = [];
    const map: Map<string, RankingRequest[]> = new Map();
    for (let index = 0; index < data?.length; index++) {
      const rankingRequest = data[index];

      const rankingRequests = map.get(rankingRequest.rankingCategoryId.toString());
      let position = 0;
      if (rankingRequests && rankingRequests.length > 0) {
        position = await this.getCurrentPosition(rankingRequests, rankingRequest?._id.toString());
      } else {
        const newRankingRequests = await this.rankingRequestRepository.findAll(
          {
            rankingCategoryId: rankingRequest?.rankingCategoryId,
            isDeleted: { $ne: DeletionStatus.DELETED },
            bbrScore: { $exists: true },
            status: {
              $in: [
                RankingCategoryStatus.ACTIVE,
                RankingCategoryStatus.DRAFT,
                RankingCategoryStatus.PENDING,
              ],
            },
          },
          {
            sort: {
              'bbrScore': -1,
            },
          }
        );
        position = await this.getCurrentPosition(
          newRankingRequests.data,
          rankingRequest?._id.toString()
        );

        map.set(rankingRequest.rankingCategoryId.toString(), newRankingRequests.data);
      }
      updatedData.push({
        ...rankingRequest,
        position,
      });
    }
    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listRankingRequestForUserDto
    );

    return { pagination, rankingRequests: updatedData };
  }

  async create(
    createRankingRequestDto: CreateRankingRequestDto,
    user: JwtPayloadType
  ): Promise<RankingRequest> {
    const rankingCategory = await this.rankingCategoryRepository.findById(
      createRankingRequestDto.rankingCategoryId.toString()
    );
    if (!rankingCategory) {
      throw new NotFoundException(
        `Ranking category with id:${createRankingRequestDto.rankingCategoryId}`
      );
    }
    if (rankingCategory.status !== RankingCategoryStatus.ACTIVE) {
      throw new BadRequestException(
        `Ranking category with id:${createRankingRequestDto.rankingCategoryId} is not active`
      );
    }

    const residence = await this.residenceRepository.findById(
      createRankingRequestDto.residenceId.toString()
    );

    if (!residence) {
      throw new NotFoundException(`Residence with id:${createRankingRequestDto.residenceId}`);
    }
    if (residence.status !== ResidenceStatus.ACTIVE) {
      throw new BadRequestException(
        `Residence with id:${createRankingRequestDto.residenceId} is not active`
      );
    }

    const isRankingRequestExist = await this.rankingRequestRepository.find({
      rankingCategoryId: new Types.ObjectId(createRankingRequestDto.rankingCategoryId),
      residenceId: new Types.ObjectId(createRankingRequestDto.residenceId),
    });

    if (isRankingRequestExist) {
      throw new BadRequestException(
        `Ranking category with rankingCategoryId:${createRankingRequestDto.rankingCategoryId} and
         residenceId:${createRankingRequestDto.residenceId} is already exist`
      );
    }
    const transformedDto: any = {
      ...createRankingRequestDto,
      rankingCategoryId: new Types.ObjectId(createRankingRequestDto.rankingCategoryId),
      residenceId: new Types.ObjectId(createRankingRequestDto.residenceId),
    };

    if (user.role == UserRole.SELLER) {
      transformedDto.developerId = new Types.ObjectId(user.sub);
    }

    await this.residenceActivityLogRepository.create({
      residenceId: new Types.ObjectId(createRankingRequestDto.residenceId),
      activityType: 'Submitted for ranking',
      details: {
        name: rankingCategory.title,
      },
      userId: new Types.ObjectId(user.sub),
      createdAt: new Date(),
    });

    const rankingRequest = await this.rankingRequestRepository.create(transformedDto);
    await this.rankingRequestDraftRepository.create({
      ...transformedDto,
      rankingRequestId: new Types.ObjectId(rankingRequest.id),
    });
    return rankingRequest;
  }

  async update(
    rankingRequestId: string,
    user: JwtPayloadType,
    updateRankingRequestDto: UpdateRankingRequestDto
  ): Promise<RankingRequest> {
    const transformedDto = {
      ...updateRankingRequestDto,
      updatedById: new Types.ObjectId(user.sub),
      bbrScore: 0,
    };

    if (updateRankingRequestDto.criteriaScores) {
      transformedDto.criteriaScores = this.transformCriteriaScores(
        updateRankingRequestDto.criteriaScores
      );
      const bbrScore = await this.calculateBBRScore(
        rankingRequestId,
        updateRankingRequestDto.criteriaScores
      );
      transformedDto.bbrScore = bbrScore;
    }

    const rankingRequestDraft = await this.checkRankingRequestDraft(rankingRequestId);
    if (rankingRequestDraft) {
      return await this.rankingRequestDraftRepository.update(
        rankingRequestDraft.id,
        transformedDto
      );
    }
    return await this.rankingRequestDraftRepository.create({
      ...transformedDto,
      rankingRequestId: new Types.ObjectId(rankingRequestId),
    });
  }

  async improveRankingRequest(
    rankingRequestId: string,
    user: JwtPayloadType,
    improveRankingRequestDto: ImproveRankingRequestDto
  ): Promise<RankingRequest> {
    const transformedDto = {
      ...improveRankingRequestDto,
      upload: improveRankingRequestDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
      updatedById: new Types.ObjectId(user.sub),
    };

    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    if (rankingRequest.status !== RankingRequestStatus.ACTIVE) {
      throw new BadRequestException(`Ranking request with ID ${rankingRequest} is not active`);
    }

    const rankingRequestDraft = await this.checkRankingRequestDraft(rankingRequestId);
    if (rankingRequestDraft) {
      throw new BadRequestException(
        `There is already Ranking request draft exist for ranking request with id:${rankingRequestId}`
      );
    }
    return await this.rankingRequestDraftRepository.create({
      ...transformedDto,
      rankingRequestId: new Types.ObjectId(rankingRequestId),
    });
  }

  public transformCriteriaScores(
    criteriaScores: {
      criteriaId: string | Types.ObjectId;
      score: number;
      description?: string;
    }[]
  ): {
    criteriaId: Types.ObjectId;
    score: number;
    description?: string;
  }[] {
    return criteriaScores.map((criteria) => ({
      criteriaId: new Types.ObjectId(criteria.criteriaId),
      score: criteria.score,
      description: criteria.description,
    }));
  }

  async findRankingRequestById(id: string) {
    const rankingRequest = await this.rankingRequestRepository.findById(id);
    if (!rankingRequest) {
      throw new NotFoundException(`Ranking request with ID ${id}`);
    }

    return rankingRequest;
  }

  async approveRankingRequest(rankingRequestId: string, userId: string) {
    try {
      await this.checkRankingRequestRejectedStatus(rankingRequestId);

      const rankingRequestDraftRequest = await this.checkRankingRequestDraft(rankingRequestId);
      if (!rankingRequestDraftRequest) {
        throw new BadRequestException(
          `Not found pending ranking request Draft Request with rankingRequestId ${rankingRequestId}`
        );
      }
      const draftRequestId = rankingRequestDraftRequest.id.toString();

      const updatedRankingRequestDraftRequest = await this.rankingRequestDraftRepository.update(
        draftRequestId,
        {
          status: RankingRequestStatus.ACTIVE,
          updatedById: new Types.ObjectId(userId),
        }
      );
      const plainUpdatedDrafRequest = updatedRankingRequestDraftRequest.toJSON();
      delete plainUpdatedDrafRequest.rankingRequestId;
      delete plainUpdatedDrafRequest._id;

      const residence = await this.residenceRepository.findById(
        plainUpdatedDrafRequest.residenceId
      );

      if (
        !residence?.highestBbrScore ||
        residence.highestBbrScore < plainUpdatedDrafRequest.bbrScore
      ) {
        await this.residenceRepository.update(residence.id, {
          highestBbrScore: plainUpdatedDrafRequest.bbrScore,
          highestRankingCategoryId: new Types.ObjectId(plainUpdatedDrafRequest.rankingCategoryId),
        });
      }
      await this.rankingRequestRepository.update(rankingRequestId, {
        ...plainUpdatedDrafRequest,
        paymentStatus: PaymentStatus.PAID,
      });

      const rankingCategory = await this.rankingCategoryRepository.find({
        _id: updatedRankingRequestDraftRequest.rankingCategoryId,
      });

      await this.residenceActivityLogRepository.create({
        residenceId: new Types.ObjectId(updatedRankingRequestDraftRequest.residenceId),
        activityType: 'Ranked',
        details: {
          name: rankingCategory.title,
          id: rankingCategory.id,
        },
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      return updatedRankingRequestDraftRequest;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while approving the ranking request',
        error
      );
    }
  }

  async checkRankingRequestRejectedStatus(rankingRequestId: string) {
    const rankingRequest = await this.rankingRequestRepository.findById(rankingRequestId);
    if (!rankingRequest) {
      throw new NotFoundException(`Ranking request with ID ${rankingRequestId}`);
    }
    if (rankingRequest.status === RankingRequestStatus.REJECTED) {
      throw new BadRequestException(`Rejected ranking request cannot be updated`);
    }
  }

  async getTop10ResidencesBasedOnViews(listTop10RankedResidenceDto: ListTop10RankedResidenceDto) {
    const result = await this.rankingRequestRepository.getTop10ResidencesWithRankingRequests();
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const updatedData = data.map((rankingRequest) => {
      const cleanRankingRequest = rankingRequest;

      return {
        ...cleanRankingRequest,
        views: Math.floor(Math.random() * 11),
        save: Math.floor(Math.random() * 11),
        inquiries: Math.floor(Math.random() * 11),
      };
    });

    if (listTop10RankedResidenceDto.isDownload) {
      if (listTop10RankedResidenceDto.fileType === 'csv') {
        return this.generateCsv(updatedData);
      } else if (listTop10RankedResidenceDto.fileType === 'excel') {
        return this.generateExcel(updatedData);
      }
    }

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      {
        limit: 10,
        page: 1,
        sortBy: 'view',
        sortOrder: 'asc',
      }
    );

    return { pagination, top10RankingResidence: data };
  }

  async rejectRankingRequest(
    rankingRequestId: string,
    userId: string,
    rejectRankingRequestDto: RejectRankingRequestDto
  ) {
    await this.checkRankingRequestRejectedStatus(rankingRequestId);

    const rankingRequestDraftRequest = await this.checkRankingRequestDraft(rankingRequestId);
    if (!rankingRequestDraftRequest) {
      throw new BadRequestException(
        `Not found pending ranking request Draft Request with rankingRequestId ${rankingRequestId}`
      );
    }

    const updatedResidenceDraftRequest = await this.rankingRequestDraftRepository.update(
      rankingRequestDraftRequest.id,
      {
        status: RankingRequestStatus.REJECTED,
        rejectionReason: rejectRankingRequestDto.reason,
        updatedById: new Types.ObjectId(userId),
      }
    );

    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    if (
      rankingRequest.status === RankingRequestStatus.PENDING ||
      rankingRequest.status === RankingRequestStatus.DRAFT
    ) {
      await this.rankingRequestDraftRepository.update(rankingRequestId, {
        status: RankingRequestStatus.REJECTED,
        rejectionReason: rejectRankingRequestDto.reason,
        updatedById: new Types.ObjectId(userId),
      });
    }
    return updatedResidenceDraftRequest;
  }

  async updateRankingRequestStatus(
    rankingRequestId: string,
    userId: string,
    updateRankingRequestStatusDto: UpdateRankingRequestStatusDto
  ) {
    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    if (!rankingRequest) {
      throw new NotFoundException(`Ranking request with ID ${rankingRequestId} not found`);
    }

    if (
      [
        RankingRequestStatus.DRAFT,
        RankingRequestStatus.REJECTED,
        RankingRequestStatus.ACTIVE,
      ].includes(updateRankingRequestStatusDto.status)
    ) {
      throw new BadRequestException(
        `Cannot update ranking request with status: ${updateRankingRequestStatusDto.status}`
      );
    }
    const updatePayload: any = {
      status: updateRankingRequestStatusDto.status,
      updatedById: new Types.ObjectId(userId),
    };

    if (updateRankingRequestStatusDto.status === RankingRequestStatus.DELETED) {
      updatePayload.isDeleted = DeletionStatus.DELETED;
    }

    return await this.rankingRequestRepository.update(rankingRequestId, updatePayload);
  }

  async checkRankingRequestDraft(rankingRequestId: string) {
    return await this.rankingRequestDraftRepository.find({
      rankingRequestId: new Types.ObjectId(rankingRequestId),
      status: { $in: [RankingRequestStatus.DRAFT, RankingRequestStatus.PENDING] },
    });
  }

  async unarchiveRankingRequest(rankingRequestId: string, userId: string): Promise<any> {
    const rankingRequest = await this.rankingRequestRepository.find({
      _id: new Types.ObjectId(rankingRequestId),
      status: RankingRequestStatus.ARCHIVED,
    });

    if (!rankingRequest) {
      throw new NotFoundException(
        `Ranking request with ID ${rankingRequestId} with status: ${RankingRequestStatus.ARCHIVED} not found`
      );
    }

    if (rankingRequest?.developerId) {
      const developer = await this.userRepository.find({
        _id: rankingRequest.developerId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!developer) {
        throw new BadRequestException(
          `Developer with ID ${rankingRequest.developerId} does not exist or is deleted`
        );
      }
    }

    if (rankingRequest?.residenceId) {
      const residence = await this.residenceRepository.find({
        _id: rankingRequest.residenceId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!residence) {
        throw new BadRequestException(
          `Residence with ID ${rankingRequest.residenceId} does not exist or is deleted`
        );
      }
    }

    if (rankingRequest?.rankingCategoryId) {
      const rankingCategory = await this.rankingCategoryRepository.find({
        _id: rankingRequest.rankingCategoryId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!rankingCategory) {
        throw new BadRequestException(
          `RankingCategory with ID ${rankingRequest.rankingCategoryId} does not exist or is deleted`
        );
      }
    }

    const updatedRankingRequest = await this.rankingRequestRepository.update(rankingRequestId, {
      status: RankingRequestStatus.ACTIVE,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedRankingRequest;
  }

  async listResidencesWithDraft(listRankingRequestWithDraftDto: ListRankingRequestWithDraftDto) {
    const result = await this.rankingRequestRepository.listRankingRequestWithDraft(
      listRankingRequestWithDraftDto
    );
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      listRankingRequestWithDraftDto
    );

    return { pagination, rankingRequests: data };
  }

  async calculateBBRScore(
    rankingRequestId: string,
    criteriaScores: { criteriaId: Types.ObjectId; score: number }[]
  ): Promise<number> {
    // Fetch the ranking category associated with the ranking request
    const rankingRequest = await this.rankingRequestRepository.findById(rankingRequestId);
    if (!rankingRequest) {
      throw new BadRequestException('Ranking request not found.');
    }

    const rankingCategory = await this.rankingCategoryRepository.findById(
      rankingRequest.rankingCategoryId._id.toString()
    );

    if (!rankingCategory || !rankingCategory.criteria) {
      throw new BadRequestException('Ranking category or its criteria not found.');
    }

    // Map criteria scores by ID for easy lookup
    const criteriaScoresMap = new Map(
      criteriaScores.map((scoreObj) => [scoreObj.criteriaId.toString(), scoreObj.score])
    );

    // Calculate the BBR score as a weighted sum
    const totalScore = rankingCategory.criteria.reduce((sum, criterion) => {
      const score = criteriaScoresMap.get(criterion?.['_id']?.toString());
      const weight = criterion.weight;

      if (score == null) {
        throw new BadRequestException(`Missing score for criterion ${criterion.name}`);
      }

      return sum + (score * weight) / 100;
    }, 0);

    // Normalize the total score to a 10-point scale
    const bbrScore = Math.round((totalScore / 10) * 100) / 100; // Rounds to 2 decimal places

    return bbrScore;
  }

  private async generateCsv(residences): Promise<Buffer> {
    const csvStream = format({ headers: true });
    const bufferStream = new Writable();
    const data: Buffer[] = [];

    bufferStream._write = (chunk, encoding, next) => {
      data.push(chunk);
      next();
    };

    csvStream.pipe(bufferStream);

    residences.forEach((rankingRequest: any) => {
      csvStream.write({
        'Residence Name': rankingRequest?.residence?.name || '',
        'Location': rankingRequest?.location?.name || '',
        'Developer': rankingRequest?.developer?.fullName || '',
        'Views': rankingRequest?.views || 0,
        'Saves': rankingRequest?.saves || 0,
        'Inquiries': rankingRequest?.inquiries || 0,
      });
    });

    csvStream.end();

    const csvFile = await new Promise<Buffer>((resolve) => {
      bufferStream.on('finish', () => {
        resolve(Buffer.concat(data));
      });
    });

    return csvFile;
  }

  private async generateExcel(rankingRequests): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheetData = rankingRequests.map((rankingRequest: any) => {
      return {
        'Residence Name': rankingRequest?.residence?.name || '',
        'Location': rankingRequest?.location?.name || '',
        'Developer': rankingRequest?.developer?.fullName || '',
        'Views': rankingRequest?.views || 0,
        'Saves': rankingRequest?.saves || 0,
        'Inquiries': rankingRequest?.inquiries || 0,
      };
    });

    // Convert data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Residences');

    // Write the workbook to a buffer
    const excelFileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    return excelFileBuffer;
  }

  public async adjustRankingAndCriteria(
    newPosition: number,
    rankingRequestId: string,
    changeRankingScore: ChangeRankingScore
  ) {
    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    const { data } = await this.rankingRequestRepository.findAll(
      {
        rankingCategoryId: new Types.ObjectId(rankingRequest?.rankingCategoryId),
        status: RankingRequestStatus.ACTIVE,
        bbrScore: { $exists: true },
      },
      {
        sort: { bbrScore: -1 },
      }
    );

    if (data.length === 0) {
      throw new NotFoundException('Ranking requests not found');
    }

    const targetIndex = newPosition;

    const { aboveRequest, belowRequest } = this.findUpperAndLowerRequest(
      targetIndex,
      data,
      changeRankingScore
    );

    const currentPosition = await this.getCurrentPosition(data, rankingRequestId.toString());

    if (aboveRequest && belowRequest) {
      const difference = aboveRequest.bbrScore - belowRequest.bbrScore;

      if (difference < 0.01) {
        return changeRankingScore == ChangeRankingScore.INCREASE
          ? await this.adjustIncreasingRanking(data, currentPosition, newPosition)
          : await this.adjustDecreasingRanking(data, currentPosition, newPosition);
      }

      return this.adjustCriteria(
        data[currentPosition],
        (aboveRequest.bbrScore + belowRequest.bbrScore) / 2
      );
    }

    return changeRankingScore == ChangeRankingScore.INCREASE
      ? await this.adjustIncreasingRanking(data, currentPosition, newPosition)
      : await this.adjustDecreasingRanking(data, currentPosition, newPosition);
  }

  public async previewIncreaseRankingAndCriteria(
    newPosition: number,
    rankingRequestId: string,
    changeRankingScore: ChangeRankingScore
  ) {
    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    const { data } = await this.rankingRequestRepository.findAll(
      {
        rankingCategoryId: new Types.ObjectId(rankingRequest?.rankingCategoryId),
        status: RankingRequestStatus.ACTIVE,
        bbrScore: { $exists: true },
      },
      {
        sort: { bbrScore: -1 },
      }
    );

    if (data.length === 0) {
      throw new NotFoundException('Ranking requests not found');
    }

    const targetIndex = newPosition;
    const currentPosition = await this.getCurrentPosition(data, rankingRequestId.toString());

    const { aboveRequest, belowRequest } = this.findUpperAndLowerRequest(
      targetIndex,
      data,
      changeRankingScore
    );

    const updatedRankingRequests = [];
    const nextBbrScore = data[targetIndex].bbrScore;

    // Update positions for items between target and current position
    for (let index = targetIndex; index < currentPosition; index++) {
      updatedRankingRequests.push({
        ...data[index].toObject(),
        bbrScore:
          aboveRequest &&
          belowRequest &&
          Math.abs(aboveRequest.bbrScore - belowRequest.bbrScore) >= 0.01
            ? data[index].bbrScore
            : data[index + 1]?.bbrScore,
        position: index + 1,
      });
    }

    // Add the moved item at target position
    updatedRankingRequests.unshift({
      ...data[currentPosition].toObject(),
      bbrScore:
        aboveRequest &&
        belowRequest &&
        Math.abs(aboveRequest.bbrScore - belowRequest.bbrScore) >= 0.01
          ? (aboveRequest.bbrScore + belowRequest.bbrScore) / 2
          : nextBbrScore,
      position: targetIndex,
    });

    return { rankingRequests: updatedRankingRequests };
  }

  public async previewDecreaseRankingAndCriteria(
    newPosition: number,
    rankingRequestId: string,
    changeRankingScore: ChangeRankingScore
  ) {
    const rankingRequest = await this.findRankingRequestById(rankingRequestId);

    const { data } = await this.rankingRequestRepository.findAll(
      {
        rankingCategoryId: new Types.ObjectId(rankingRequest?.rankingCategoryId),
        status: RankingRequestStatus.ACTIVE,
        bbrScore: { $exists: true },
      },
      {
        sort: { bbrScore: -1 },
      }
    );

    if (data.length === 0) {
      throw new NotFoundException('Ranking requests not found');
    }

    const targetIndex = newPosition;
    const currentPosition = await this.getCurrentPosition(data, rankingRequestId.toString());

    const { aboveRequest, belowRequest } = this.findUpperAndLowerRequest(
      targetIndex,
      data,
      changeRankingScore
    );

    const updatedRankingRequests = [];
    const nextBbrScore = data[targetIndex].bbrScore;

    // Update positions for items between target and current position
    for (let index = targetIndex; index > currentPosition; index--) {
      updatedRankingRequests.push({
        ...data[index].toObject(),
        bbrScore:
          aboveRequest &&
          belowRequest &&
          Math.abs(aboveRequest.bbrScore - belowRequest.bbrScore) >= 0.01
            ? data[index].bbrScore
            : data[index - 1]?.bbrScore,
        position: index - 1,
      });
    }

    // Add the moved item at target position
    updatedRankingRequests.unshift({
      ...data[currentPosition].toObject(),
      bbrScore:
        aboveRequest &&
        belowRequest &&
        Math.abs(aboveRequest.bbrScore - belowRequest.bbrScore) >= 0.01
          ? (aboveRequest.bbrScore + belowRequest.bbrScore) / 2
          : nextBbrScore,
      position: targetIndex,
    });

    return { rankingRequests: updatedRankingRequests };
  }

  private findUpperAndLowerRequest(
    targetIndex: number,
    rankingRequests: RankingRequest[],
    changeRankingScore: ChangeRankingScore
  ): {
    aboveRequest: RankingRequest;
    belowRequest: RankingRequest;
  } {
    if (changeRankingScore === ChangeRankingScore.INCREASE) {
      return {
        aboveRequest: rankingRequests[targetIndex - 1],
        belowRequest: rankingRequests[targetIndex],
      };
    }
    return {
      aboveRequest: rankingRequests[targetIndex],
      belowRequest: rankingRequests[targetIndex + 1],
    };
  }

  private async getCurrentPosition(
    rankingRequests: RankingRequest[],
    rankingRequestId: string
  ): Promise<number> {
    const index = rankingRequests.findIndex(
      (request) => request._id.toString() === rankingRequestId
    );

    return index !== -1 ? index : -1;
  }

  private async adjustIncreasingRanking(
    rankingRequests: RankingRequest[],
    currentPosition: number,
    targetPosition: number
  ) {
    const targetBbrSCore = rankingRequests[targetPosition]?.bbrScore;
    for (let index = targetPosition; index < currentPosition; index++) {
      await this.adjustCriteria(rankingRequests[index], rankingRequests[index + 1]?.bbrScore);
    }
    return await this.adjustCriteria(rankingRequests[currentPosition], targetBbrSCore);
  }

  private async adjustDecreasingRanking(
    rankingRequests: RankingRequest[],
    currentPosition: number,
    targetPosition: number
  ) {
    const targetBbrSCore = rankingRequests[targetPosition]?.bbrScore;
    for (let index = targetPosition; index > currentPosition; index--) {
      await this.adjustCriteria(rankingRequests[index], rankingRequests[index - 1]?.bbrScore);
    }
    return await this.adjustCriteria(rankingRequests[currentPosition], targetBbrSCore);
  }

  private async adjustCriteria(rankingRequest: RankingRequest, newBbrSCore: number) {
    let totalIncreaseNewBbrSCore: number = (newBbrSCore - rankingRequest?.bbrScore) * 10;
    const criteriaScores = [];
    for (let index = 0; index < rankingRequest?.criteriaScores?.length; index++) {
      const { newCriteria, newTotalIncreaseNewBbrSCore } = this.adjustRankingScore(
        rankingRequest,
        totalIncreaseNewBbrSCore,
        index
      );
      criteriaScores.push(newCriteria);
      totalIncreaseNewBbrSCore = newTotalIncreaseNewBbrSCore;
    }

    const updatedRankingRequest = await this.rankingRequestRepository.update(rankingRequest.id, {
      criteriaScores,
      bbrScore: newBbrSCore,
    });

    const residence = await this.residenceRepository.findById(
      updatedRankingRequest.residenceId._id.toString()
    );
    if (
      residence.highestRankingCategoryId.toString() ===
        rankingRequest.rankingCategoryId.toString() ||
      residence.highestBbrScore < newBbrSCore
    ) {
      await this.residenceRepository.update(residence.id, {
        highestBbrScore: newBbrSCore,
        highestRankingCategoryId: rankingRequest.rankingCategoryId,
      });
    }
    return updatedRankingRequest;
  }

  private adjustRankingScore(
    rankingRequest: RankingRequest,
    totalIncreaseNewBbrSCore: number,
    index: number
  ) {
    const remainingScore =
      totalIncreaseNewBbrSCore > 0
        ? 100 - rankingRequest?.criteriaScores?.[index]?.score
        : rankingRequest?.criteriaScores?.[index]?.score;

    if (totalIncreaseNewBbrSCore > 0) {
      if (totalIncreaseNewBbrSCore - remainingScore >= 0) {
        const newCriteria = {
          criteriaId: new Types.ObjectId(rankingRequest?.criteriaScores?.[index]?.criteriaId),
          score: 100,
          description: rankingRequest?.criteriaScores?.[index]?.description,
        };
        return {
          newCriteria,
          newTotalIncreaseNewBbrSCore: totalIncreaseNewBbrSCore - remainingScore,
        };
      } else {
        const newCriteria = {
          criteriaId: new Types.ObjectId(rankingRequest?.criteriaScores?.[index]?.criteriaId),
          score: rankingRequest?.criteriaScores?.[index]?.score + totalIncreaseNewBbrSCore,
          description: rankingRequest?.criteriaScores?.[index]?.description,
        };
        return {
          newCriteria,
          newTotalIncreaseNewBbrSCore: 0,
        };
      }
    } else {
      if (totalIncreaseNewBbrSCore + remainingScore >= 0) {
        const newCriteria = {
          criteriaId: new Types.ObjectId(rankingRequest?.criteriaScores?.[index]?.criteriaId),
          score: rankingRequest?.criteriaScores?.[index]?.score + totalIncreaseNewBbrSCore,
          description: rankingRequest?.criteriaScores?.[index]?.description,
        };
        return {
          newCriteria,
          newTotalIncreaseNewBbrSCore: 0,
        };
      } else {
        const newCriteria = {
          criteriaId: new Types.ObjectId(rankingRequest?.criteriaScores?.[index]?.criteriaId),
          score: 0,
          description: rankingRequest?.criteriaScores?.[index]?.description,
        };
        return {
          newCriteria,
          newTotalIncreaseNewBbrSCore:
            rankingRequest?.criteriaScores?.[index]?.score + totalIncreaseNewBbrSCore,
        };
      }
    }
  }

  public async previewRankingChange(
    newPosition: number,
    rankingRequestId: string,
    changeRankingScore: ChangeRankingScore
  ) {
    // Input validation
    if (newPosition < 0) {
      throw new BadRequestException('New position must be non-negative');
    }

    const rankingRequest = await this.findRankingRequestById(rankingRequestId);
    if (!rankingRequest) {
      throw new NotFoundException(`Ranking request with ID ${rankingRequestId} not found`);
    }

    // Get all ranking requests for the category
    const { data } = await this.rankingRequestRepository.findAll(
      { rankingCategoryId: new Types.ObjectId(rankingRequest?.rankingCategoryId) },
      {
        sort: { bbrScore: -1 },
      }
    );

    if (data.length === 0) {
      throw new NotFoundException('Ranking requests not found');
    }

    // Get current position
    const currentPosition = await this.getCurrentPosition(data, rankingRequestId);
    if (currentPosition === -1) {
      throw new NotFoundException(
        `Ranking request with ID ${rankingRequestId} not found in the list`
      );
    }

    // Call appropriate preview function based on change type
    switch (changeRankingScore) {
      case ChangeRankingScore.INCREASE:
        return await this.previewIncreaseRankingAndCriteria(
          newPosition,
          rankingRequestId,
          changeRankingScore
        );

      case ChangeRankingScore.DECREASE:
        return await this.previewDecreaseRankingAndCriteria(
          newPosition,
          rankingRequestId,
          changeRankingScore
        );

      default:
        throw new BadRequestException('Invalid change ranking score type');
    }
  }
}
