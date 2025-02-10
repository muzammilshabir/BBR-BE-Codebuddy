import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PropertyType } from './schema/propertyType.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { DeletionStatus } from '../unit/enum/unit-enum';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class PropertyTypeRepository extends BaseRepository<PropertyType> {
  constructor(
    @InjectModel(PropertyType.name) private readonly propertyTypeModel: Model<PropertyType>
  ) {
    super(propertyTypeModel);
  }

  async findByIdInDetail(propertyTypeId: string): Promise<any> {
    const isObjectId = Types.ObjectId.isValid(propertyTypeId);
    const propertyType = await this.propertyTypeModel
      .findOne({
        ...(isObjectId ? { _id: new Types.ObjectId(propertyTypeId) } : { slug: propertyTypeId }),
        isDeleted: { $ne: DeletionStatus.DELETED },
      })
      .populate([
        { path: 'createdBy', model: 'User', select: 'fullName email role' },
        { path: 'updatedBy', model: 'User', select: 'fullName email role' },
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      ]);

    if (!propertyType) {
      throw new NotFoundException(`propertyType with ID ${propertyTypeId}`);
    }

    return propertyType;
  }
}
