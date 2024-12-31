import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReviewRepository } from './reviews.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Review } from './schema/reviews.schema';
import { CreateReviewDto } from './dto/create-reviews.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { BulkMark, DeletionStatus } from './enum/review-enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailEvent } from 'src/mailer/events/send-email.event';
import { ResidenceService } from 'src/residences/residences.service';
import { UserService } from 'src/users/user.service';
import { User } from 'src/users/schema/user.schema';
import { JwtPayloadType } from 'src/auth/type/jwt-payload.type';
import { RequestReviewDto } from './dto/request-review.dto';
import { Residence } from 'src/residences/schema/residences.schema';
import { RespondToReviewDto } from './dto/respond-review';

@Injectable()
export class ReviewService {
  
  private convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)
  
    return array.map(it => {
      return Object.values(it).toString()
    }).join('\n')
  }

  private matchReviewWordsWithReview(reviewWords: string[], review: string): string[] {
    const result = [];
    for (const word of reviewWords) {
      if(review.includes(word)) {
        result.push(word);
      }
    }
    return result;
  }

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userFromToken: JwtPayloadType, createReviewDto: CreateReviewDto): Promise<Review> {
    const transformedDto = {
      ...createReviewDto,
      residence: new Types.ObjectId(createReviewDto.residenceId),
      photos: createReviewDto.photos.map(
        (photo) => new Types.ObjectId(photo)
      ),
      createdById: new Types.ObjectId(userFromToken.sub),
    };
    const createdReview = await this.reviewRepository.create(transformedDto);

    const residence = await this.residenceService.getResidenceById(createReviewDto.residenceId.toString());
    const residenceSeller = await this.userService.findById(residence.createdByIdId);
    if(residenceSeller && residenceSeller.reviewWordsForAlert.length > 0) {
      const matchedWords = this.matchReviewWordsWithReview(residenceSeller?.reviewWordsForAlert, createdReview.review.details.concat(createdReview.review.title));
      if (matchedWords.length > 0) await this.sendReviewWordsMatchEmail(residenceSeller.email, residenceSeller.fullName, residence.name, matchedWords.toString());
    }
    if(createReviewDto.rating < 4) {
      await this.sendLowStarReviewEmail(residenceSeller.email, residenceSeller.fullName, residence.name, createReviewDto.rating.toString());
    }

    if(createReviewDto.rating == 5) {
      await this.checkAndSetHundredFiveStarReviewsBadge(residenceSeller);
    }
    return createdReview;
  }

  private async checkAndSetHundredFiveStarReviewsBadge(seller: User) {
    const { count } = await this.reviewRepository.findAll([
      { $match: { rating: 5 } },
      {
          $lookup:
          {
              from: "residences",
              localField: "residenceId",
              foreignField: "_id",
              as: "residence"
          }
      },
      { $match: { "residence.createdByIdId": seller._id } },
    ]);
    if (count >= 100) {
      this.userService.update(seller._id.toString(), {
        hundredFiveStarReviews: true,
      });
      await this.sendHundredFiveStarReviewsBadgeEmail(
        seller.email,
        seller.fullName,
      );
    }
  }

  async respondToReview(reviewId: string, respondToReviewDto: RespondToReviewDto): Promise<any> {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId}`);
    }
    const updatedValues: Partial<Review> = {
      isResponded: true,
      response: respondToReviewDto.response,
    };
    if(review.isResponded) {
      updatedValues.isResponseEdited = true;
    }
    const updatedReview = await this.reviewRepository.update(reviewId, updatedValues);
    await this.sendReviewResponseEmail(
      review.createdById.email,
      review.createdById.fullName,
      review.residence.name,
    );
    return updatedReview;
  }

  async requestReview(userFromToken: JwtPayloadType, requestReviewDto: RequestReviewDto): Promise<any> {

    const residence = await this.residenceService.getResidenceById(requestReviewDto.residenceId.toString()) as Residence;
    const residenceBuyer = await this.userService.findById(requestReviewDto.buyerId.toString());
    const residenceSeller = await this.userService.findById(userFromToken.sub);

    await this.sendRequestReviewEmail(
      residenceBuyer.email,
      residenceBuyer.fullName,
      residence.name,
      residenceSeller.fullName,
    );

    return "Email sent to Buyer successfully.";
  }

  async getReviewById(reviewId: string): Promise<any> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId}`);
    }
    return review;
  }

  async listReviews(listReviewsDto: ListReviewsDto) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      residence: new Types.ObjectId(listReviewsDto.residenceId),
    };
    if(listReviewsDto.isFlagged) {
      filter.isFlagged = true;
    }

    if(listReviewsDto.search) {
      filter.$or = [
        { "review.title": { $regex: listReviewsDto.search, $options: 'i' } },
      ];
    }

    const options = PaginationService.prepareOptions(listReviewsDto);

    const { data, count } = await this.reviewRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listReviewsDto);

    return { pagination, reviews: data };
  }

  async getStatsByResidenceId(residenceId: string) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      residence: new Types.ObjectId(residenceId),
    };

    const { data, count } = await this.reviewRepository.findAll(filter);

    if (data.length < 1) {
      throw new NotFoundException(`Review Stats for Residence`);
    }
    let totalRating = 0;
    for (const review of data) {
      totalRating += review.rating;
    }
    
    return { averageRating: totalRating/count, totalReviews: count };
  }

  async processWeeklySummaries() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      created_on: {
        $gte: oneWeekAgo, 
        $lt: new Date()
      }
    };

    const { data } = await this.reviewRepository.findAll(filter);

    if (data.length < 1) {
      return;
    }
    const summaries: {
      totalRating: number,
      count: number,
    }[] = [];
    for (const review of data) {
      const key = review.residence.createdById.toString();
      if(key in summaries) {
        summaries[key].totalRating += review.rating;
        summaries[key].count++;
      } else {
        summaries[key] = {
          totalRating: review.rating,
          count: 1,
        };
      }
    }
    for (const userId in summaries) {
      if (Object.prototype.hasOwnProperty.call(summaries, userId)) {
        const summary = summaries[userId];
        const avgRatings = summary.totalRating/summary.count;
        const user = await this.userService.findById(userId);
        this.sendWeeklySummaryEmail(
          user.email,
          user.fullName,
          summary.count.toString(),
          avgRatings.toString(),
        );
      }
    }
  }

  async exportReviewsByResidenceId(residenceId: string) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      residenceId: new Types.ObjectId(residenceId),
    };

    const { data } = await this.reviewRepository.findAll(filter);

    return { reviews: this.convertToCSV(data) };

  }

  async getHighlightedReviewsByResidenceId(residenceId: string) {
    const filter: any = {
      isDeleted: DeletionStatus.ACTIVE,
      residenceId: new Types.ObjectId(residenceId),
      isHighlighted: true,
    };

    const { data } = await this.reviewRepository.findAll(filter, {
      offset: 0,
      limit: 3,
      sort: [['createdAt', 1]],
    });
    
    return { reviews: data };
  }

  async flagReview(reviewId: string): Promise<any> {
    const existingReview = await this.reviewRepository.update(reviewId, { isFlagged: true });
    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${reviewId}`);
    }
    return existingReview;
  }

  async bulkMarking(residenceId: string, reviewIds: string[], mark: BulkMark): Promise<any> {
    let query = {};
    if(mark == BulkMark.REMOVAL) {
      query = { isRemovalRequested: true };
    } else if(mark = BulkMark.RESPONDED) {
      query = { isResponded: true };
    }
    for (const reviewId of reviewIds) {
      await this.reviewRepository.updateWithFilter({
        residenceId,
        reviewId,
      }, query); 
    }
    return { message: "Bulk Action Performed" };
  }

  private async sendLowStarReviewEmail(
    email: string,
    name: string,
    residence: string,
    star: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          residence,
          star,
        },
        template: 'low-star-review',
        subject: 'Low Rating Review Received',
        toEmail: email,
      })
    );
  }

  private async sendWeeklySummaryEmail(
    email: string,
    name: string,
    reviews: string,
    rating: string,
  ) {
    const date = new Date;
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          reviews,
          rating,
        },
        template: 'review-weekly-summary',
        subject: `Reviews Weekly Summary (${date.getDate()}-${date.getMonth()}-${date.getFullYear()})`,
        toEmail: email,
      })
    );
  }

  private async sendReviewWordsMatchEmail(
    email: string,
    name: string,
    residence: string,
    words: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          residence,
          words,
        },
        template: 'specific-words-review',
        subject: 'Review Received with Matched Words',
        toEmail: email,
      })
    );
  }

  private async sendReviewResponseEmail(
    email: string,
    name: string,
    residence: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          residence,
        },
        template: 'review-response',
        subject: 'Response on Review Received',
        toEmail: email,
      })
    );
  }

  private async sendHundredFiveStarReviewsBadgeEmail(
    email: string,
    name: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
        },
        template: 'hundred-five-star-reviews',
        subject: 'New Badge Unlocked',
        toEmail: email,
      })
    );
  }

  private async sendRequestReviewEmail(
    email: string,
    name: string,
    residence: string,
    seller: string,
  ) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          name,
          residence,
          seller,
        },
        template: 'request-review',
        subject: 'Review Requested',
        toEmail: email,
      })
    );
  }
}
