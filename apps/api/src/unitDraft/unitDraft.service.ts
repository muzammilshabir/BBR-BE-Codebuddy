import { Injectable } from '@nestjs/common';
import { UnitDraftRepository } from './unitDraft.repository';

@Injectable()
export class UnitDraftService {
  constructor(private readonly unitDraftRepository: UnitDraftRepository) {}
}
