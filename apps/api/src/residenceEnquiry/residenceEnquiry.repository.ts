import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceEnquiry } from './schema/residenceEnquiry.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class ResidenceEnquiryRepository extends BaseRepository<ResidenceEnquiry> {
  constructor(
    @InjectModel(ResidenceEnquiry.name)
    private readonly residenceEnquiryModel: Model<ResidenceEnquiry>
  ) {
    super(residenceEnquiryModel);
  }
}
