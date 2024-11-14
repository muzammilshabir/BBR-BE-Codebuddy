import { Injectable } from '@nestjs/common';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RequestReviewDto } from './dto/request-review.dto';
import { ResidenceService } from '../residences/residences.service';
import { Residence } from '../residences/schema/residences.schema';
import { UserService } from '../users/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailEvent } from '../mailer/events/send-email.event';

@Injectable()
export class CustomerReviewsService {
  constructor(
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async requestReview(
    userFromToken: JwtPayloadType,
    requestReviewDto: RequestReviewDto
  ): Promise<any> {
    const residence = (await this.residenceService.getResidenceById(
      requestReviewDto.residenceId.toString()
    )) as Residence;
    const residenceSeller = await this.userService.findById(userFromToken.sub);

    for (const email of requestReviewDto.emails) {
      await this.sendRequestReviewEmail(
        email,
        residence.name,
        residenceSeller.fullName,
        process.env.REVIEW_FRONTEND_URL
      );
    }

    return 'Email sent to recipients successfully.';
  }

  private async sendRequestReviewEmail(
    email: string,
    residence: string,
    seller: string,
    url: string
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          residence,
          seller,
          url,
        },
        template: 'customer-request-review',
        subject: 'Review Requested',
        toEmail: email,
      })
    );
  }
}
