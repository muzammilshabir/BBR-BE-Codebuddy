import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClaimRequestService } from './claimRequest.service';

@ApiTags('ClaimRequest')
@Controller('claim-request')
export class ClaimRequestController {
  constructor(private readonly claimRequestService: ClaimRequestService) {}
}
