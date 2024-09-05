import { Injectable } from '@nestjs/common';
import { ResidenceDraftRepository } from './residencesDraft.repository';

@Injectable()
export class ResidenceDraftService {
  constructor(private readonly residenceDraftRepository: ResidenceDraftRepository) {}
}
