import { Injectable } from '@nestjs/common';
import { ClaimRequestRepository } from './claimRequest.repository';

@Injectable()
export class ClaimRequestService {
  constructor(private readonly claimRequestRepository: ClaimRequestRepository) {}
}
