import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeatureRequestRepository } from '../featureRequests.repository';
import { FeatureRequestStatus } from '../enum/feature-request-status';
import { ResidenceRepository } from 'src/residences/residences.repository';

@Injectable()
export class FeatureRequestCronService {
  private readonly logger = new Logger(FeatureRequestCronService.name);

  constructor(
    private readonly featureRequestRepository: FeatureRequestRepository,
    private readonly residenceRepository: ResidenceRepository
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredFeatureRequests() {
    try {
      const currentDate = new Date();
      const expiredRequests = await this.featureRequestRepository.findAll({
        status: FeatureRequestStatus.APPROVED,
        featuredTo: { $lt: currentDate },
        isDeleted: false,
      });

      for (const request of expiredRequests.data) {
        await this.residenceRepository.update(request.residenceId.toString(), {
          isFeatured: false,
        });
      }

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