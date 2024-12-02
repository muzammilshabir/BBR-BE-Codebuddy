import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeatureRequestRepository } from '../featureRequests.repository';
import { FeatureRequestStatus } from '../enum/feature-request-status';

@Injectable()
export class FeatureRequestCronService {
  private readonly logger = new Logger(FeatureRequestCronService.name);

  constructor(private readonly featureRequestRepository: FeatureRequestRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredFeatureRequests() {
    try {
      const currentDate = new Date();
      const result = await this.featureRequestRepository.updateMany(
        {
          status: FeatureRequestStatus.APPROVED,
          featuredTo: { $lt: currentDate },
          isDeleted: false,
        },
        {
          $set: {
            status: FeatureRequestStatus.EXPIRED,
            updatedAt: currentDate,
          },
        }
      );


      this.logger.log(`Updated ${result.modifiedCount} expired feature requests`);
    } catch (error) {
      this.logger.error('Error in handleExpiredFeatureRequests cron job:', error);
    }
  }
} 