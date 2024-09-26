import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClaimRequest } from './schema/claimRequest.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ClaimRequestRepository extends BaseRepository<ClaimRequest> {
  constructor(
    @InjectModel(ClaimRequest.name)
    private readonly claimRequestModel: Model<ClaimRequest>
  ) {
    super(claimRequestModel);
  }
}
