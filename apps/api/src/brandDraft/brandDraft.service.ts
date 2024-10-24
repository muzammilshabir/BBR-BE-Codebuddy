import { Injectable } from '@nestjs/common';
import { BrandDraftRepository } from './brandDraft.repository';

@Injectable()
export class BrandDraftService {
  constructor(private readonly brandDraftRepository: BrandDraftRepository) {}
}
