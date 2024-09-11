import { Injectable } from '@nestjs/common';
import { ResidenceDraftRepository } from './residencesDraft.repository';

@Injectable()
export class ResidenceDraftService {
  constructor(private readonly residenceDraftRepository: ResidenceDraftRepository) {}

  async getResidenceDraftById(residenceDraftId: string): Promise<any> {
    const residenceDetails = await this.residenceDraftRepository.findByIdInDetail(residenceDraftId);
    return residenceDetails;
  }
}
