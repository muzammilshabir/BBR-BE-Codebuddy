import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FeatureRequest } from './schema/featureRequest.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class FeatureRequestRepository extends BaseRepository<FeatureRequest> {
  constructor(
    @InjectModel(FeatureRequest.name)
    private readonly featureRequestModel: Model<FeatureRequest>,
  ) {
    super(featureRequestModel);
  }

  async getActiveFeatureRequests() {
    const currentDate = new Date();
    return this.featureRequestModel
      .find({
        status: 'approved',
        featuredFrom: { $lte: currentDate },
        featuredTo: { $gte: currentDate },
        isDeleted: false,
      })
      .populate('residenceId')
      .limit(5)
      .sort({ featuredFrom: -1 })
      .exec();
  }

  async hasActiveOrPendingRequest(residenceId: string): Promise<boolean> {
    const currentDate = new Date();
    const count = await this.featureRequestModel.countDocuments({
      residenceId: new Types.ObjectId(residenceId),
      isDeleted: false,
      $or: [
        { status: 'pending' },
        {
          status: 'approved',
          featuredTo: { $gte: currentDate },
        },
      ],
    });
    return count > 0;
  }
} 