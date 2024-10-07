import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { RankingCategoryRepository } from './rankingCategory.repository';
import { CreateRankingCategoryDto } from './dto/create-ranking-category.dto';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RankingCategory } from './schema/rankingCategory.schema';
import { RankingCategoryStatus } from './enum/rankingCategory-status.enum';
import { UpdateRankingCategoryDto } from './dto/update-ranking-category.dto';
import { CategoryType } from './enum/category-type.enum';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { PropertyTypeRepository } from '../propertyType/propertyType.repository';
import { RankingCategoryListDto } from './dto/list-ranking-category.dto';

@Injectable()
export class RankingCategoryService {
  constructor(
    private readonly rankingCategoryRepository: RankingCategoryRepository,
    private readonly lifeStyleRepository: LifeStyleRepository,
    private readonly propertyTypeRepository: PropertyTypeRepository
  ) {}

  async findAll(rankingCategoryDto: RankingCategoryListDto, user: JwtPayloadType) {
    const { search, status, limit, page } = rankingCategoryDto;

    const query: any = {
      isDeleted: { $ne: DeletionStatus.DELETED },
      createdById: new Types.ObjectId(user.sub),
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    return await this.rankingCategoryRepository.findAll(query, rankingCategoryDto, [
      {
        path: 'lifeStyleSubCategoryId',
        select: 'name description',
        model: 'LifeStyle',
      },
      {
        path: 'propertyTypeSubCategoryId',
        select: 'name',
        model: 'PropertyType',
      },
      {
        path: 'createdById',
        select: 'name email',
        model: 'User',
      },
    ]);
  }

  async create(
    createResidenceDto: CreateRankingCategoryDto,
    user: JwtPayloadType
  ): Promise<RankingCategory> {
    const transformedDto: any = {
      ...createResidenceDto,
      createdById: new Types.ObjectId(user.sub),
      upload: createResidenceDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
    };
    if (createResidenceDto?.lifeStyleSubCategoryId) {
      const lifeStyle = await this.lifeStyleRepository.find({
        _id: createResidenceDto?.lifeStyleSubCategoryId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!lifeStyle) {
        throw new BadRequestException(
          `lifeStyle with ID ${createResidenceDto.lifeStyleSubCategoryId} does not exist or is deleted`
        );
      }
      const isSubCategoryExist = await this.rankingCategoryRepository.find({
        categoryType: CategoryType.LIFESTYLE,
        lifeStyleSubCategoryId: new Types.ObjectId(createResidenceDto?.lifeStyleSubCategoryId),
      });
      if (isSubCategoryExist) {
        throw new BadRequestException(
          `Ranking category for lifeStyle sub category with ID ${createResidenceDto.lifeStyleSubCategoryId} already exist `
        );
      }

      transformedDto.lifeStyleSubCategoryId = new Types.ObjectId(
        createResidenceDto?.lifeStyleSubCategoryId
      );
    }

    if (createResidenceDto?.propertyTypeSubCategoryId) {
      const propertyType = await this.propertyTypeRepository.find({
        _id: createResidenceDto?.propertyTypeSubCategoryId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!propertyType) {
        throw new BadRequestException(
          `property type with ID ${createResidenceDto.propertyTypeSubCategoryId} does not exist or is deleted`
        );
      }
      const isSubCategoryExist = await this.rankingCategoryRepository.find({
        categoryType: CategoryType.PROPERTY_TYPE,
        propertyTypeSubCategoryId: new Types.ObjectId(
          createResidenceDto?.propertyTypeSubCategoryId
        ),
      });
      if (isSubCategoryExist) {
        throw new BadRequestException(
          `Ranking category for property type sub category with ID ${createResidenceDto.lifeStyleSubCategoryId} already exist `
        );
      }
      transformedDto.propertyTypeSubCategoryId = new Types.ObjectId(
        createResidenceDto?.propertyTypeSubCategoryId
      );
    }

    transformedDto.status =
      createResidenceDto.status === RankingCategoryStatus.PENDING
        ? RankingCategoryStatus.PENDING
        : RankingCategoryStatus.DRAFT;

    return await this.rankingCategoryRepository.create(transformedDto);
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

    const transformedDto = {
      ...updateRankingCategoryDto,
      upload: updateRankingCategoryDto.upload?.map((upload) => ({
        ImageId: new Types.ObjectId(upload.ImageId),
        type: upload.type,
      })),
      updatedById: new Types.ObjectId(user.sub),
    };

    if (updateRankingCategoryDto?.propertyTypeSubCategoryId) {
      const propertyType = await this.propertyTypeRepository.find({
        _id: updateRankingCategoryDto?.propertyTypeSubCategoryId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!propertyType) {
        throw new BadRequestException(
          `Property type with ID ${updateRankingCategoryDto.propertyTypeSubCategoryId} does not exist or is deleted`
        );
      }

      const isSubCategoryExist = await this.rankingCategoryRepository.find({
        categoryType: CategoryType.PROPERTY_TYPE,
        propertyTypeSubCategoryId: new Types.ObjectId(
          updateRankingCategoryDto?.propertyTypeSubCategoryId
        ),
      });
      if (
        isSubCategoryExist &&
        rankingCategory._id.toString() !== isSubCategoryExist._id.toString()
      ) {
        throw new BadRequestException(
          `Ranking category for property type sub category with ID ${updateRankingCategoryDto.propertyTypeSubCategoryId} already exists`
        );
      }

      transformedDto.propertyTypeSubCategoryId = new Types.ObjectId(
        updateRankingCategoryDto?.propertyTypeSubCategoryId
      );
    }

    if (updateRankingCategoryDto?.lifeStyleSubCategoryId) {
      const lifeStyle = await this.lifeStyleRepository.find({
        _id: updateRankingCategoryDto?.lifeStyleSubCategoryId,
        isDeleted: { $ne: DeletionStatus.DELETED },
      });
      if (!lifeStyle) {
        throw new BadRequestException(
          `lifeStyle with ID ${updateRankingCategoryDto.lifeStyleSubCategoryId} does not exist or is deleted`
        );
      }
      const isSubCategoryExist = await this.rankingCategoryRepository.find({
        categoryType: CategoryType.LIFESTYLE,
        lifeStyleSubCategoryId: new Types.ObjectId(
          updateRankingCategoryDto?.lifeStyleSubCategoryId
        ),
      });
      if (
        isSubCategoryExist &&
        rankingCategory._id.toString() !== isSubCategoryExist._id.toString()
      ) {
        throw new BadRequestException(
          `Ranking category for lifeStyle sub category with ID ${updateRankingCategoryDto.lifeStyleSubCategoryId} already exist `
        );
      }

      transformedDto.lifeStyleSubCategoryId = new Types.ObjectId(
        updateRankingCategoryDto?.lifeStyleSubCategoryId
      );
    }

    transformedDto.status =
      updateRankingCategoryDto.status === RankingCategoryStatus.PENDING
        ? RankingCategoryStatus.PENDING
        : RankingCategoryStatus.DRAFT;
    return await this.rankingCategoryRepository.update(rankingCategoryId, transformedDto);
  }

  async findRankingCategoryById(id: string): Promise<RankingCategory> {
    const rankingCategory = await this.rankingCategoryRepository.findById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Residence with ID ${id}`);
    }
    return rankingCategory;
  }

  async findRankingCategory(id: string, user: JwtPayloadType): Promise<RankingCategory> {
    const rankingCategory = await this.findRankingCategoryById(id);
    if (!rankingCategory) {
      throw new NotFoundException(`Residence with ID ${id}`);
    }
    if (rankingCategory.createdById._id.toString() !== user.sub) {
      throw new ForbiddenException('You do not have permission to delete this RankingCategory');
    }
    return rankingCategory;
  }

  async delete(id: string, user: JwtPayloadType): Promise<RankingCategory> {
    const existingCategory = await this.findRankingCategoryById(id);

    if (!existingCategory) {
      throw new NotFoundException(`RankingCategory with ID ${id} not found`);
    }
    if (existingCategory.createdById._id.toString() !== user.sub) {
      throw new ForbiddenException('You do not have permission to delete this RankingCategory');
    }

    existingCategory.isDeleted = true;
    return await existingCategory.save();
  }
}
