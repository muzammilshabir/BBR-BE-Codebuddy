import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingCategoryRepository } from './rankingCategory.repository';
import { CreateRankingCategoryDto } from './dto/create-ranking-category.dto';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingCategory } from './schema/rankingCategory.schema';
import { RankingCategoryStatus } from './enum/rankingCategory-status.enum';
import {
  UpdateRankingCategoryDto,
  UpdateRankingCategoryStatusDto,
} from './dto/update-ranking-category.dto';
import { DeletionStatus } from '../unit/enum/unit-enum';
import {
  PopularRankingCategoryListDto,
  PublicRankingCategoryListDto,
  RankingCategoryListDto,
} from './dto/list-ranking-category.dto';
import { RejectRankingCategoryDto } from './dto/reject-ranking-category.dto';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { CityRepository } from '../city/city.repository';
import { CountryRepository } from '../country/country.repository';
import { LocationRepository } from '../location/location.repository';
import { PropertyTypeRepository } from '../propertyType/propertyType.repository';
import { RankingRequestStatus } from '../rankingRequest/enum/rankingRequest-status.enum';
import { GeographicalAreasRepository } from '../geographicalAreas/geographicalAreas.repository';
import { BrandRepository } from '../brand/brand.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RankingCategoryService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly rankingCategoryDraftRepository: RankingCategoryDraftRepository,
    private readonly lifeStyleRepository: LifeStyleRepository,
    private readonly cityRepository: CityRepository,
    private readonly countryRepository: CountryRepository,
    private readonly locationRepository: LocationRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository,
    private readonly geographicalAreasRepository: GeographicalAreasRepository,
    private readonly brandRepository: BrandRepository,
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {}

  async findAll(rankingCategoryDto: RankingCategoryListDto) {
    const {
      search,
      status,
      createdById,
      categoryType,
      countryId,
      cityId,
      locationId,
      propertyTypeId,
      lifeStyleId,
      geoGraphyId,
      brandId,
    } = rankingCategoryDto;

    const query: any = {
      isDeleted: { $ne: DeletionStatus.DELETED },
    };

    // Text search for name or description fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category type
    if (categoryType) {
      query.categoryType = categoryType;
    }

    // Filter by createdById
    if (createdById) {
      query.createdById = new Types.ObjectId(createdById);
    }

    // Additional filters based on IDs
    if (countryId) {
      query.countryId = new Types.ObjectId(countryId);
    }

    if (cityId) {
      query.cityId = new Types.ObjectId(cityId);
    }

    if (locationId) {
      query.locationId = new Types.ObjectId(locationId);
    }

    if (propertyTypeId) {
      query.propertyTypeId = new Types.ObjectId(propertyTypeId);
    }

    if (lifeStyleId) {
      query.lifeStyleId = new Types.ObjectId(lifeStyleId);
    }

    if (geoGraphyId) {
      query.geoGraphyId = new Types.ObjectId(geoGraphyId);
    }

    if (brandId) {
      query.brandId = new Types.ObjectId(brandId);
    }

    const options = PaginationService.prepareOptions(rankingCategoryDto);

    const { data, count } = await this.rankingCategoryRepository.findAll(query, options, [
      {
        path: 'createdById',
        select: 'fullName email role',
        model: 'User',
      },
      {
        path: 'upload.ImageId',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
      {
        path: 'countryId',
        select: 'name code',
        model: 'Country',
      },
      {
        path: 'cityId',
        select: 'name state',
        model: 'City',
      },
      {
        path: 'locationId',
        select: 'name coordinates',
        model: 'Location',
      },
      {
        path: 'propertyTypeId',
        select: 'name type description',
        model: 'PropertyType',
      },
      {
        path: 'geoGraphyId',
        select: 'type upload name',
        model: 'GeographicalAreas',
      },
      {
        path: 'lifeStyleId',
        select: 'name category',
        model: 'LifeStyle',
      },
      {
        path: 'rankingRequests',
        match: { status: RankingRequestStatus.ACTIVE },
        options: { sort: { bbrScore: -1 } },
      },
      {
        path: 'brandId',
        select: 'name logo description',
        model: 'Brand',
      },
    ]);

    const updatedData = [];
    for (const rankingCategory of data) {
      const cleanRankingCategory = rankingCategory.toObject();

      updatedData.push({
        ...cleanRankingCategory,
        // This is a sample analytics function to calculate engagement score
        // Once the analytics module is complete, this logic may be updated
        engagementScore: this.calculateEngagementScore(
          this.getMatrixWeight(),
          this.generateRandomMetrics()
        ),
      });
    }

    const { pagination } = PaginationService.paginate({ rows: data, count }, rankingCategoryDto);

    return { pagination, rankingCategories: updatedData };
  }

  async create(
    createRankingCategoryDto: CreateRankingCategoryDto,
    user: JwtPayloadType
  ): Promise<RankingCategory> {
    const transformedDto: any = {
      ...createRankingCategoryDto,
      createdById: new Types.ObjectId(user.sub),
      upload: createRankingCategoryDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
      status: RankingCategoryStatus.DRAFT,
    };

    if (createRankingCategoryDto?.cityId) {
      const city = await this.cityRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.cityId),
        isDeleted: { $ne: DeletionStatus.DELETED },
        active: true
      });
      if (!city) {
        throw new BadRequestException(
          `City with ID ${createRankingCategoryDto.cityId} does not exist or is deleted`
        );
      }
      transformedDto.cityId = new Types.ObjectId(createRankingCategoryDto.cityId);
    }

    if (createRankingCategoryDto?.lifeStyleId) {
      const lifeStyle = await this.lifeStyleRepository.find({
        _id: createRankingCategoryDto.lifeStyleId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!lifeStyle) {
        throw new BadRequestException(
          `lifeStyle with ID ${createRankingCategoryDto.lifeStyleId} does not exist or is deleted`
        );
      }
      transformedDto.lifeStyleId = new Types.ObjectId(createRankingCategoryDto.lifeStyleId);
    }

    if (createRankingCategoryDto?.countryId) {
      const country = await this.countryRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.countryId),
        isDeleted: { $ne: DeletionStatus.DELETED },
        active: true
      });
      if (!country) {
        throw new BadRequestException(
          `Country with ID ${createRankingCategoryDto.countryId} does not exist or is deleted`
        );
      }
      transformedDto.countryId = new Types.ObjectId(createRankingCategoryDto.countryId);
    }

    if (createRankingCategoryDto?.locationId) {
      const location = await this.locationRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.locationId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!location) {
        throw new BadRequestException(
          `Location with ID ${createRankingCategoryDto.locationId} does not exist or is deleted`
        );
      }
      transformedDto.locationId = new Types.ObjectId(createRankingCategoryDto.locationId);
    }

    if (createRankingCategoryDto?.propertyTypeId) {
      const propertyType = await this.propertyTypeRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.propertyTypeId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!propertyType) {
        throw new BadRequestException(
          `Property Type with ID ${createRankingCategoryDto.propertyTypeId} does not exist or is deleted`
        );
      }
      transformedDto.propertyTypeId = new Types.ObjectId(createRankingCategoryDto.propertyTypeId);
    }

    if (createRankingCategoryDto?.geoGraphyId) {
      const geographicalArea = await this.geographicalAreasRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.geoGraphyId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!geographicalArea) {
        throw new BadRequestException(
          `GeographicalArea  with ID ${createRankingCategoryDto.geoGraphyId} does not exist or is deleted`
        );
      }
      transformedDto.geoGraphyId = new Types.ObjectId(createRankingCategoryDto.geoGraphyId);
    }

    if (createRankingCategoryDto?.brandId) {
      const brand = await this.brandRepository.find({
        _id: new Types.ObjectId(createRankingCategoryDto.brandId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${createRankingCategoryDto.brandId} does not exist or is deleted`
        );
      }
      transformedDto.brandId = new Types.ObjectId(createRankingCategoryDto.brandId);
    }

    const rankingCategory = await this.rankingCategoryRepository.create(transformedDto);

    const rankingCategoryDraft = await this.rankingCategoryDraftRepository.create({
      ...transformedDto,
      rankingCategoryId: new Types.ObjectId(rankingCategory.id),
    });

    if (
      createRankingCategoryDto.status &&
      createRankingCategoryDto.status === RankingCategoryStatus.ACTIVE
    ) {
      await this.rankingCategoryDraftRepository.update(rankingCategoryDraft.id, {
        status: RankingCategoryStatus.PENDING,
        updatedById: new Types.ObjectId(user.sub),
      });
      return this.rankingCategoryRepository.update(rankingCategory.id, {
        status: RankingCategoryStatus.PENDING,
        updatedById: new Types.ObjectId(user.sub),
      });
    }
    return rankingCategory;
  }

  async update(
    rankingCategoryId: string,
    user: JwtPayloadType,
    updateRankingCategoryDto: UpdateRankingCategoryDto
  ): Promise<RankingCategory> {
    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);
    if (rankingCategory.createdById._id.toString() !== user.sub) {
      throw new ForbiddenException('You do not have permission to update this RankingCategory');
    }

    const transformedDto: any = {
      ...updateRankingCategoryDto,
      upload: updateRankingCategoryDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
      updatedById: new Types.ObjectId(user.sub),
    };

    delete transformedDto.status;
    if (updateRankingCategoryDto?.cityId) {
      const city = await this.cityRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.cityId),
        isDeleted: { $ne: DeletionStatus.DELETED },
        active: true
      });
      if (!city) {
        throw new BadRequestException(
          `City with ID ${updateRankingCategoryDto.cityId} does not exist or is deleted`
        );
      }
      transformedDto.cityId = new Types.ObjectId(updateRankingCategoryDto.cityId);
    }

    if (updateRankingCategoryDto?.lifeStyleId) {
      const lifeStyle = await this.lifeStyleRepository.find({
        _id: updateRankingCategoryDto.lifeStyleId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!lifeStyle) {
        throw new BadRequestException(
          `lifeStyle with ID ${updateRankingCategoryDto.lifeStyleId} does not exist or is deleted`
        );
      }
      transformedDto.lifeStyleId = new Types.ObjectId(updateRankingCategoryDto.lifeStyleId);
    }

    if (updateRankingCategoryDto?.countryId) {
      const country = await this.countryRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.countryId),
        isDeleted: { $ne: DeletionStatus.DELETED },
        active: true
      });
      if (!country) {
        throw new BadRequestException(
          `Country with ID ${updateRankingCategoryDto.countryId} does not exist or is deleted`
        );
      }
      transformedDto.countryId = new Types.ObjectId(updateRankingCategoryDto.countryId);
    }

    if (updateRankingCategoryDto?.locationId) {
      const location = await this.locationRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.locationId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!location) {
        throw new BadRequestException(
          `Location with ID ${updateRankingCategoryDto.locationId} does not exist or is deleted`
        );
      }
      transformedDto.locationId = new Types.ObjectId(updateRankingCategoryDto.locationId);
    }

    if (updateRankingCategoryDto?.propertyTypeId) {
      const propertyType = await this.propertyTypeRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.propertyTypeId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!propertyType) {
        throw new BadRequestException(
          `Property Type with ID ${updateRankingCategoryDto.propertyTypeId} does not exist or is deleted`
        );
      }
      transformedDto.propertyTypeId = new Types.ObjectId(updateRankingCategoryDto.propertyTypeId);
    }

    if (updateRankingCategoryDto?.geoGraphyId) {
      const geographicalArea = await this.geographicalAreasRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.geoGraphyId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!geographicalArea) {
        throw new BadRequestException(
          `GeographicalArea  with ID ${updateRankingCategoryDto.geoGraphyId} does not exist or is deleted`
        );
      }
      transformedDto.geoGraphyId = new Types.ObjectId(updateRankingCategoryDto.geoGraphyId);
    }

    if (updateRankingCategoryDto?.brandId) {
      const brand = await this.brandRepository.find({
        _id: new Types.ObjectId(updateRankingCategoryDto.brandId),
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${updateRankingCategoryDto.brandId} does not exist or is deleted`
        );
      }
      transformedDto.brandId = new Types.ObjectId(updateRankingCategoryDto.brandId);
    }

    const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
    if (rankingCategoryDraft) {
      return await this.rankingCategoryDraftRepository.update(
        rankingCategoryDraft.id,
        transformedDto
      );
    }

    return await this.rankingCategoryDraftRepository.create({
      ...transformedDto,
      rankingCategoryId: new Types.ObjectId(rankingCategoryId),
    });
  }

  async findRankingCategoryById(id: string): Promise<RankingCategory> {
    const rankingCategory = await this.rankingCategoryRepository.findById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Ranking category with ID ${id}`);
    }
    return rankingCategory;
  }

  async checkRankingCategoryDraft(rankingCategoryId: string) {
    return await this.rankingCategoryDraftRepository.find({
      rankingCategoryId: new Types.ObjectId(rankingCategoryId),
      status: { $in: [RankingCategoryStatus.DRAFT, RankingCategoryStatus.PENDING] },
    });
  }

  async findRankingCategory(id: string) {
    const rankingCategory = await this.findRankingCategoryById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Residence with ID ${id}`);
    }
    return {
      ...rankingCategory.toJSON(),
      engagementScore: this.calculateEngagementScore(
        this.getMatrixWeight(),
        this.generateRandomMetrics()
      ),
    };
  }

  async approveRankingCategory(rankingCategoryId: string, userId: string) {
    try {
      await this.checkRankingCategoryRejectedStatus(rankingCategoryId);

      const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
      if (!rankingCategoryDraft) {
        throw new BadRequestException(
          `Not found pending Ranking category Draft Request with rankingCategoryId ${rankingCategoryId}`
        );
      }
      const draftRequestId = rankingCategoryDraft.id.toString();

      const updatedRankingCategoryDraftRequest = await this.rankingCategoryDraftRepository.update(
        draftRequestId,
        {
          status: RankingCategoryStatus.ACTIVE,
          updatedById: new Types.ObjectId(userId),
        }
      );

      const plainUpdatedDrafRequest = updatedRankingCategoryDraftRequest.toJSON();
      delete plainUpdatedDrafRequest.residenceId;
      delete plainUpdatedDrafRequest._id;

      await this.rankingCategoryRepository.update(rankingCategoryId, {
        ...plainUpdatedDrafRequest,
      });

      return updatedRankingCategoryDraftRequest;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while approving the ranking category',
        error
      );
    }
  }

  async checkRankingCategoryRejectedStatus(rankingCategoryId: string) {
    const rankingCategory = await this.rankingCategoryRepository.findById(rankingCategoryId);
    if (!rankingCategory) {
      throw new NotFoundException(`Ranking Category with ID ${rankingCategoryId}`);
    }
    if (rankingCategory.status === RankingCategoryStatus.REJECTED) {
      throw new BadRequestException(`Rejected  Ranking Category cannot be updated`);
    }
  }

  async rejectRankingCategory(
    rankingCategoryId: string,
    userId: string,
    rejectRankingCategoryDto: RejectRankingCategoryDto
  ) {
    await this.checkRankingCategoryRejectedStatus(rankingCategoryId);

    const rankingCategoryDraft = await this.checkRankingCategoryDraft(rankingCategoryId);
    if (!rankingCategoryDraft) {
      throw new BadRequestException(
        `Not found pending Ranking category Draft Request with rankingCategoryId ${rankingCategoryId}`
      );
    }

    const updatedRankingCategoryDraftRequest = await this.rankingCategoryDraftRepository.update(
      rankingCategoryDraft.id,
      {
        status: RankingCategoryStatus.REJECTED,
        rejectionReason: rejectRankingCategoryDto.reason,
        updatedById: new Types.ObjectId(userId),
      }
    );

    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);

    if (
      rankingCategory.status === RankingCategoryStatus.PENDING ||
      rankingCategory.status === RankingCategoryStatus.DRAFT
    ) {
      await this.rankingCategoryRepository.update(rankingCategoryId, {
        status: RankingCategoryStatus.REJECTED,
        rejectionReason: rejectRankingCategoryDto.reason,
        updatedById: new Types.ObjectId(userId),
      });
    }

    return updatedRankingCategoryDraftRequest;
  }

  async updateRankingCategoryStatus(
    rankingCategoryId: string,
    userId: string,
    updateRankingCategoryStatusDto: UpdateRankingCategoryStatusDto
  ) {
    const rankingCategory = await this.findRankingCategoryById(rankingCategoryId);

    if (!rankingCategory) {
      throw new NotFoundException(`Ranking Category with ID ${rankingCategoryId} not found`);
    }

    if (
      [
        RankingCategoryStatus.DRAFT,
        RankingCategoryStatus.REJECTED,
        RankingCategoryStatus.ACTIVE,
      ].includes(updateRankingCategoryStatusDto.status)
    ) {
      throw new BadRequestException(
        `Cannot update Ranking category with status: ${updateRankingCategoryStatusDto.status}`
      );
    }
    const updatePayload: any = {
      status: updateRankingCategoryStatusDto.status,
      updatedById: new Types.ObjectId(userId),
    };

    if (updateRankingCategoryStatusDto.status === RankingCategoryStatus.DELETED) {
      updatePayload.isDeleted = DeletionStatus.DELETED;
    }

    const updatedResidence = await this.rankingCategoryRepository.update(
      rankingCategoryId,
      updatePayload
    );

    return updatedResidence;
  }

  async unarchiveRankingCategory(rankingCategoryId: string, userId: string): Promise<any> {
    const rankingCategory = await this.rankingCategoryRepository.find({
      _id: new Types.ObjectId(rankingCategoryId),
      status: RankingCategoryStatus.ARCHIVED,
    });

    if (!rankingCategory) {
      throw new NotFoundException(
        `Ranking category with ID ${rankingCategoryId} with status: ${RankingCategoryStatus.ARCHIVED} not found`
      );
    }

    const updatedResidence = await this.rankingCategoryRepository.update(rankingCategoryId, {
      status: RankingCategoryStatus.DRAFT,
      updatedById: new Types.ObjectId(userId),
    });

    return updatedResidence;
  }

  async listResidencesWithDraft(rankingCategoryListDto: RankingCategoryListDto) {
    const result =
      await this.rankingCategoryRepository.listRankingCategoriesWithDraft(rankingCategoryListDto);
    const count = result[0]?.totalCount || 0;
    const data = result[0]?.data || [];

    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      rankingCategoryListDto
    );

    return { pagination, rankingCategory: data };
  }

  // TODO: This is a sample analytics function to calculate the engagement score.
  // Once the analytics module is completed, this function will need to be updated accordingly.
  private generateRandomMetrics() {
    return {
      clicks: Math.floor(Math.random() * 101),
      views: Math.floor(Math.random() * 101),
      inquiries: Math.floor(Math.random() * 101),
      shares: Math.floor(Math.random() * 101),
      addToFavorites: Math.floor(Math.random() * 101),
      interactionTime: Math.floor(Math.random() * 101),
    };
  }

  // TODO: This is a sample analytics function to calculate the engagement score.
  // Once the analytics module is completed, this function will need to be updated accordingly.
  private getMatrixWeight() {
    const weights = {
      clicks: 30,
      views: 15,
      inquiries: 25,
      shares: 10,
      addToFavorites: 15,
      interactionTime: 5,
    };
    return weights;
  }

  private calculateEngagementScore(weights, metrics) {
    let weightedScore = 0;
    let totalWeight = 0;

    // Calculate the weighted sum of all metrics
    for (const metric in weights) {
      if (weights.hasOwnProperty(metric) && metrics.hasOwnProperty(metric)) {
        const weight = weights[metric];
        const count = metrics[metric];
        weightedScore += count * (weight / 100);
        totalWeight += weight;
      }
    }

    // Ensure weights sum to 100% to avoid incorrect calculations
    if (totalWeight !== 100) {
      throw new Error('Total weight of all metrics should be 100%');
    }

    // Convert the score to a 10-point scale by dividing the weighted score by 10
    const engagementScore = Math.round((weightedScore / 10) * 100) / 100;
    return engagementScore;
  }

  async findAllPublic(rankingCategoryDto: PublicRankingCategoryListDto) {
    // Add 'active' status directly to the DTO or query object
    const query = { ...rankingCategoryDto, status: 'active' };
    // Pass the query to the existing findAll method
    return this.findAll(query as RankingCategoryListDto);
  }

  async findAllByPopularity(popularRankingCategoryDto: PopularRankingCategoryListDto) {
    const pipeline = [
      {
        $match: {
          isDeleted: { $ne: true },
          status: { $eq: RankingCategoryStatus.ACTIVE },
        },
      },
      {
        $lookup: {
          from: 'rankingrequestdrafts',
          let: { rankingCategoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$rankingCategoryId', '$$rankingCategoryId'] },
                    { $eq: ['$status', 'active'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
          ],
          as: 'requests',
        },
      },
      {
        $lookup: {
          from: 'uploads',
          let: { imageIds: '$upload.ImageId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$imageIds'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                originalFileKey: 1,
                fileKey: 1,
                url: 1,
                mimeType: 1,
              },
            },
          ],
          as: 'uploadDetails',
        },
      },
      {
        $addFields: {
          totalRequests: { $size: '$requests' },
          uploads: '$uploadDetails',
        },
      },
      {
        $sort: {
          totalRequests: -1,
          title: 1,
        },
      },
      {
        $skip: (popularRankingCategoryDto.page - 1) * popularRankingCategoryDto.limit,
      },
    ];

    const dataPipeline = [
      ...pipeline,
      {
        $limit: popularRankingCategoryDto.limit,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          totalRequests: 1,
          categoryType: 1,
          description: 1,
          price: 1,
          uploads: 1,
        },
      },
    ];
    const countPipeline = [
      ...pipeline,
      {
        $count: 'totalCount',
      },
    ];

    const result = await Promise.all([
      this.rankingCategoryModel.aggregate(dataPipeline as PipelineStage[]),
      this.rankingCategoryModel.aggregate(countPipeline as PipelineStage[]),
    ]);

    // Prepare the pagination object
    const totalDocs = result[1][0]?.totalCount || 0;
    const limit = popularRankingCategoryDto.limit; // Get limit from DTO
    const currentPage = popularRankingCategoryDto.page; // Get current page from DTO
    const totalPages = Math.ceil(totalDocs / limit); // Calculate total pages

    const paginationObject = {
      limit,
      currentPage,
      totalDocs,
      totalPages,
      hasNextPage: currentPage < totalPages, // Check if there's a next page
      hasPrevPage: currentPage > 1, // Check if there's a previous page
    };

    return { pagination: paginationObject, rankingCategories: result[0] };
  }
}
