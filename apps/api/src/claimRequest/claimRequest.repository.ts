import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClaimRequest } from './schema/claimRequest.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';

@Injectable()
export class ClaimRequestRepository extends BaseRepository<ClaimRequest> {
  constructor(
    @InjectModel(ClaimRequest.name)
    private readonly claimRequestModel: Model<ClaimRequest>
  ) {
    super(claimRequestModel);
  }
  async findByIdInDetail(id: string): Promise<any> {
    const claimRequest: any = await this.claimRequestModel
      .findById(id)
      .populate([
        { path: 'residenceId' },
        { path: 'developerId', model: 'User', select: 'fullName email role' },
      ]);

    if (!claimRequest) {
      throw new NotFoundException(`claimRequest with ID ${id}`);
    }

    return claimRequest;
  }
}
