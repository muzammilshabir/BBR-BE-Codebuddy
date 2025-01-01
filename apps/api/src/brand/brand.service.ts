import { Injectable } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { ListBrandDto } from './dto/listBrand.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateBrandDto, UpdateBrandStatusDto } from './dto/updateBrand.dto';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { CreateBrandApplyDto, CreateBrandDraftDto } from './dto/createBrandDraft.dto';
import { BrandDraftRepository } from '../brandDraft/brandDraft.repository';
import { BrandStatus } from './enum/brand-enum';
import { Types } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { ResidenceService } from '../residences/residences.service';
import { ResidenceStatus } from '../residences/enum/residence-enum';
import { PipelineStage } from 'mongoose';
import { BrandActivityLogRepository } from 'src/brand-activity-log/brand-activity-log.repository';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandDraftRepository: BrandDraftRepository,
    private readonly residenceService: ResidenceService,
    private readonly brandActivityLogRepository: BrandActivityLogRepository
  ) {}

  async findAll(listBrandDto: ListBrandDto) {
    try {
      const { status, brandCategoryId, search } = listBrandDto;
      const paginationOptions = PaginationService.prepareOptions(listBrandDto);

      const pipeline: PipelineStage[] = [
        // Initial match for non-deleted brands
        {
          $match: {
            isDeleted: { $ne: true },
            ...(status ? { status: status } : {}),
            ...(brandCategoryId ? { brandCategoryId: new Types.ObjectId(brandCategoryId) } : {}),
            ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
          },
        },

        // Lookup brand category
        {
          $lookup: {
            from: 'brandcategories',
            localField: 'brandCategoryId',
            foreignField: '_id',
            as: 'brandCategoryId',
          },
        },
        {
          $unwind: {
            path: '$brandCategoryId',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup uploads for images
        {
          $lookup: {
            from: 'uploads',
            let: { uploads: '$upload' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      '$_id',
                      {
                        $map: {
                          input: '$$uploads',
                          as: 'upload',
                          in: '$$upload.ImageId',
                        },
                      },
                    ],
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
                  id: '$_id',
                },
              },
            ],
            as: 'uploadDocs',
          },
        },
        {
          $addFields: {
            upload: {
              $map: {
                input: '$upload',
                as: 'uploadItem',
                in: {
                  ImageId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$uploadDocs',
                          cond: { $eq: ['$$this._id', '$$uploadItem.ImageId'] },
                        },
                      },
                      0,
                    ],
                  },
                  type: '$$uploadItem.type',
                },
              },
            },
          },
        },

        // Lookup brand drafts and their images
        {
          $lookup: {
            from: 'branddrafts',
            localField: '_id',
            foreignField: 'brandId',
            pipeline: [
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              // Add lookup for brandCategoryId
              {
                $lookup: {
                  from: 'brandcategories',
                  localField: 'brandCategoryId',
                  foreignField: '_id',
                  as: 'brandCategoryId',
                },
              },
              {
                $unwind: {
                  path: '$brandCategoryId',
                  preserveNullAndEmptyArrays: true,
                },
              },
              // Add lookup for draft images
              {
                $lookup: {
                  from: 'uploads',
                  let: { uploads: '$upload' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: [
                            '$_id',
                            {
                              $map: {
                                input: '$$uploads',
                                as: 'upload',
                                in: '$$upload.ImageId',
                              },
                            },
                          ],
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
                        id: '$_id',
                      },
                    },
                  ],
                  as: 'uploadDocs',
                },
              },
              // Map the upload docs to the upload array
              {
                $addFields: {
                  upload: {
                    $map: {
                      input: '$upload',
                      as: 'uploadItem',
                      in: {
                        ImageId: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$uploadDocs',
                                cond: { $eq: ['$$this._id', '$$uploadItem.ImageId'] },
                              },
                            },
                            0,
                          ],
                        },
                        type: '$$uploadItem.type',
                      },
                    },
                  },
                },
              },
            ],
            as: 'brandDrafts',
          },
        },

        // Lookup residences count - Moved before $facet
        {
          $lookup: {
            from: 'residences',
            let: { brandId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$associatedBrandId', '$$brandId'] },
                      { $ne: ['$isDeleted', true] },
                      { $eq: ['$status', 'active'] },
                    ],
                  },
                },
              },
              {
                $count: 'total',
              },
            ],
            as: 'residenceCount',
          },
        },
        {
          $addFields: {
            numberOfResidences: {
              $ifNull: [{ $arrayElemAt: ['$residenceCount.total', 0] }, 0],
            },
          },
        },

        // Apply sorting
        {
          $sort: paginationOptions.sort.reduce((acc, [field, order]) => {
            acc[field] = order;
            return acc;
          }, {}),
        },

        // Pagination and total count using facet
        {
          $facet: {
            data: [{ $skip: paginationOptions.offset }, { $limit: paginationOptions.limit }],
            totalCount: [{ $count: 'count' }],
          },
        },

        // Final projection to format the response
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
          },
        },
      ];

      const result = await this.brandRepository.aggregate(pipeline);
      const count = result[0]?.totalCount || 0;
      const data = result[0]?.data || [];

      const { pagination } = PaginationService.paginate({ rows: data, count }, listBrandDto);

      return { pagination, brands: data };
    } catch (error) {
      throw new Error(`Error while fetching brand list: ${error}`);
    }
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, userId: string) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id ${id} not found`);
    }

    const updatedBrand = await this.brandRepository.update(id, updateBrandDto);

    if (updateBrandDto.name || updateBrandDto.brandCategoryId) {
      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(id),
        activityType: 'General info edited',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    if (updateBrandDto.upload?.length) {
      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(id),
        activityType: 'Brand assets updated',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    return updatedBrand;
  }

  async saveAsDraft(createBrandDraftDto: CreateBrandDraftDto, userId: string) {
    const { brandId, name, description, brandCategoryId, upload, registeredDate } =
      createBrandDraftDto;

    // If brandId does not exist, create a new brand
    if (!brandId) {
      const existingBrand = await this.brandRepository.find({ name });
      if (existingBrand) {
        throw new BadRequestException(`Brand with name ${name} already exists`);
      }
      const newBrand = await this.brandRepository.create({
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.DRAFT, // New brand is saved as draft
        registeredDate,
      });

      // Create a draft associated with the new brand
      const brandDraft = await this.brandDraftRepository.create({
        brandId: newBrand._id,
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.DRAFT,
        registeredDate,
      });

      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(newBrand.id),
        activityType: 'Created',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      return brandDraft;
    }

    const existingBrand: any = await this.brandRepository.findById(brandId);
    if (!existingBrand) {
      throw new NotFoundException(`Brand with id ${brandId} not found`);
    }

    // If brandId exists, check for an existing open draft
    const existingDraft: any = await this.brandDraftRepository.find({
      brandId: new Types.ObjectId(brandId),
      status: BrandStatus.DRAFT,
    });

    if (existingDraft) {
      // Update the existing draft with the new data
      const updatePayload: any = {
        name,
        description,
        upload,
        registeredDate,
      };

      // Only update brandCategoryId if it's provided
      if (brandCategoryId) {
        updatePayload.brandCategoryId = new Types.ObjectId(brandCategoryId);
      }

      const updatedDraft = await this.brandDraftRepository.update(existingDraft._id, updatePayload);

      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(brandId),
        activityType: 'Created',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      return updatedDraft;
    }

    // If no open draft exists, create a new draft for the brand
    const newDraft = await this.brandDraftRepository.create({
      brandId: new Types.ObjectId(brandId),
      name,
      description,
      brandCategoryId: new Types.ObjectId(brandCategoryId),
      upload,
      status: BrandStatus.DRAFT,
      registeredDate,
    });

    await this.brandActivityLogRepository.create({
      brandId: new Types.ObjectId(brandId),
      activityType: 'Created',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return newDraft;
  }

  async saveAndApplyBrand(createBrandApplyDto: CreateBrandApplyDto, userId: string) {
    const { brandId, name, description, brandCategoryId, upload, registeredDate } =
      createBrandApplyDto;

    // If brandId does not exist, create a new active brand and draft
    if (!brandId) {
      const existingBrand = await this.brandRepository.find({ name });
      if (existingBrand) {
        throw new BadRequestException(`Brand with name ${name} already exists`);
      }
      const newBrand = await this.brandRepository.create({
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.ACTIVE, // New brand is marked as active
        registeredDate,
      });

      // Create an active draft associated with the new brand
      const brandDraft = await this.brandDraftRepository.create({
        brandId: newBrand._id,
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.ACTIVE, // Draft is also marked as active
        registeredDate,
      });

      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(newBrand.id),
        activityType: 'Approved',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      return { brand: newBrand, draft: brandDraft };
    }

    const existingBrand: any = await this.brandRepository.findById(brandId);
    if (!existingBrand) {
      throw new NotFoundException(`Brand with id ${brandId} not found`);
    }

    // Check if an open draft exists
    const existingDraft: any = await this.brandDraftRepository.find({
      brandId: new Types.ObjectId(brandId),
      status: BrandStatus.DRAFT,
    });

    if (existingDraft) {
      // Update the existing draft and the brand to active
      const updatedDraft = await this.brandDraftRepository.update(existingDraft._id, {
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.ACTIVE, // Mark draft as active
        registeredDate,
      });

      await this.brandRepository.update(brandId, {
        name,
        description,
        brandCategoryId: new Types.ObjectId(brandCategoryId),
        upload,
        status: BrandStatus.ACTIVE, // Mark brand as active
        registeredDate,
      });

      // Fetch the updated brand
      const updatedBrand = await this.brandRepository.findById(brandId);

      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(updatedBrand.id),
        activityType: 'Approved',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });

      return { brand: updatedBrand, draft: updatedDraft };
    }

    // If no open draft exists, create a new draft and mark the brand as active
    const newDraft = await this.brandDraftRepository.create({
      brandId: new Types.ObjectId(brandId),
      name,
      description,
      brandCategoryId: new Types.ObjectId(brandCategoryId),
      upload,
      status: BrandStatus.ACTIVE, // Mark draft as active
      registeredDate,
    });

    await this.brandRepository.update(brandId, {
      name,
      description,
      brandCategoryId: new Types.ObjectId(brandCategoryId),
      upload,
      status: BrandStatus.ACTIVE, // Mark brand as active
      registeredDate,
    });

    // Fetch the updated brand
    const updatedBrand = await this.brandRepository.findById(brandId);

    await this.brandActivityLogRepository.create({
      brandId: new Types.ObjectId(updatedBrand.id),
      activityType: 'Approved',
      userId: new Types.ObjectId(userId),
      createdAt: new Date(),
    });

    return { brand: updatedBrand, draft: newDraft };
  }

  async getBrandById(brandId: string) {
    return await this.brandRepository.getBrandById(brandId);
  }

  async updateBrandStatus(
    brandId: string,
    userId: string,
    updateBrandStatusDto: UpdateBrandStatusDto
  ): Promise<Brand> {
    const brand = await this.getBrandById(brandId);

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${brandId} not found`);
    }

    if (brand.isDeleted === true) {
      throw new BadRequestException(`Deleted brand can not be updated`);
    }
    if ([BrandStatus.DRAFT].includes(updateBrandStatusDto.status)) {
      throw new BadRequestException(
        `Cannot update brand with status: ${updateBrandStatusDto.status}`
      );
    }
    const updatePayload: any = {
      status: updateBrandStatusDto.status,
      updatedById: new Types.ObjectId(userId),
    };

    if (updateBrandStatusDto.status === BrandStatus.DELETED) {
      updatePayload.isDeleted = DeletionStatus.DELETED;
      const residences = await this.residenceService.getResidencesByAssociatedBrandId(brandId, {});

      if (residences?.data.length > 0) {
        await Promise.all(
          residences.data.map((residence) => {
            if (residence?.status === ResidenceStatus.ACTIVE) {
              return this.residenceService.updateResidenceStatus(residence.id, userId, {
                status: ResidenceStatus.ARCHIVED,
              });
            }
            // If condition is not met, return a resolved promise to maintain the array structure for Promise.all
            return Promise.resolve();
          })
        );
      }

      const updateLatestBrand = await this.brandDraftRepository.findLatest({
        brandId: new Types.ObjectId(brandId),
      });
      if (updateLatestBrand) {
        await this.brandDraftRepository.update(updateLatestBrand.id, updatePayload);
      }

      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(brandId),
        activityType: 'Deleted',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    if (updateBrandStatusDto.status === BrandStatus.ARCHIVED) {
      await this.brandActivityLogRepository.create({
        brandId: new Types.ObjectId(brandId),
        activityType: 'Archived',
        userId: new Types.ObjectId(userId),
        createdAt: new Date(),
      });
    }

    const updatedBrand = await this.brandRepository.update(brandId, updatePayload);

    return updatedBrand;
  }
}
