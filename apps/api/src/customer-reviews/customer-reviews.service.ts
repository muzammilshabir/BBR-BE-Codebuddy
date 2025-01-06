import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { RequestReviewDto } from './dto/request-review.dto';
import { ResidenceService } from '../residences/residences.service';
import { Residence } from '../residences/schema/residences.schema';
import { UserService } from '../users/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendEmailEvent } from '../mailer/events/send-email.event';
import { CreateReviewDto } from './dto/create-review.dto';
import { CustomerReview } from './schema/customerReviews.schema';
import { CustomerReviewRepository } from './customer-reviews.repository';
import { DeleteReviewsDto } from './dto/delete-reviews.dto';
import { ListReviewsBodyDto, ListReviewsDto, RatingSortType } from './dto/list-reviews.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { Types } from 'mongoose';
import { GetResidenceReviewsDto } from './dto/get-reviews-by-residenceId.dto';
import { GoogleReviewRepository } from './google-reviews.repository';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { UserRole } from 'src/users/enum/user.enum';
import { ResidenceActivityLogRepository } from 'src/residence-activity-log/residence-activity-log.repository';
import { DevResidenceActivityLogRepository } from 'src/dev-residence-activity-log/dev-residence-activity-log.repository';

@Injectable()
export class CustomerReviewsService {
  constructor(
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly customerReviewRepository: CustomerReviewRepository,
    private readonly googleReviewRepository: GoogleReviewRepository,
    private readonly httpService: HttpService,
    private readonly residenceActivityLogRepository: ResidenceActivityLogRepository,
    private readonly devResidenceActivityLogRepository: DevResidenceActivityLogRepository
  ) {}

  @Cron('0 0 * * 0')
  async handleCron() {
    await this.processAllReviews();
  }

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
        `${process.env.REVIEW_FRONTEND_URL}?residenceId=${requestReviewDto.residenceId.toString()}`
      );
    }

    return 'Email sent to recipients successfully.';
  }

  async create(createReviewDto: CreateReviewDto): Promise<CustomerReview> {
    const residence = await this.residenceService.getResidenceById(
      createReviewDto.residenceId.toString()
    );

    if (!residence) {
      throw new NotFoundException(`Residence with ID ${createReviewDto.residenceId} not found`);
    }

    const currentYear = new Date().getFullYear();

    const lastReview = await this.customerReviewRepository.findOne({
      displayId: { $regex: `^R${currentYear}-` },
    });

    const lastSequenceNumber = lastReview?.displayId?.split('-')[1];
    const nextSequenceNumber = lastSequenceNumber ? parseInt(lastSequenceNumber, 10) + 1 : 1;

    const displayId = `R${currentYear}-${nextSequenceNumber}`;

    const transformedDto = {
      ...createReviewDto,
      residence: new Types.ObjectId(createReviewDto.residenceId),
      developer: new Types.ObjectId(residence?.createdById?._id?.toString()),
      displayId,
      ...(createReviewDto.photos && {
        photos: createReviewDto.photos.map((photo) => new Types.ObjectId(photo)),
      }),
    };

    const createdReview = await this.customerReviewRepository.create(transformedDto);

    await this.residenceActivityLogRepository.create({
      residenceId: new Types.ObjectId(residence.id),
      activityType: 'The new review received',
      details: { id: createdReview.id },
      createdAt: new Date(),
    });

    await this.devResidenceActivityLogRepository.create({
      residenceId: new Types.ObjectId(residence.id),
      activityType: 'The new review received',
      details: { id: createdReview.id },
      createdAt: new Date(),
    });

    return createdReview;
  }

  async deleteReviews(deleteReviewsDto: DeleteReviewsDto) {
    const { reviewIds } = deleteReviewsDto;

    const objectIdReviewIds = reviewIds.map((id) => new Types.ObjectId(id));

    const updatedReviews = await this.customerReviewRepository.updateMany(
      { _id: { $in: objectIdReviewIds } },
      { isDeleted: true }
    );

    if (updatedReviews.modifiedCount === 0) {
      throw new NotFoundException(`No reviews found with the provided IDs`);
    }

    return;
  }

  async getReviewById(id: string) {
    const review = await this.customerReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async listReviews(
    userFromToken: JwtPayloadType,
    listReviewsDto: ListReviewsDto,
    listReviewsBodyDto: ListReviewsBodyDto
  ) {
    const filter: any = {
      isDeleted: false,
    };

    if (userFromToken.role === UserRole.SELLER) {
      filter.developer = new Types.ObjectId(userFromToken.sub);
    }

    if (userFromToken.role === UserRole.ADMIN && listReviewsBodyDto.developerIds?.length) {
      filter.developer = {
        $in: listReviewsBodyDto.developerIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (listReviewsBodyDto.residenceIds?.length) {
      filter.residence = {
        $in: listReviewsBodyDto.residenceIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (listReviewsDto.search) {
      const residenceResults = await this.customerReviewRepository.aggregate(listReviewsDto.search);
      filter.$or = [
        { fullName: { $regex: listReviewsDto.search, $options: 'i' } },
        { email: { $regex: listReviewsDto.search, $options: 'i' } },
        { phoneNumber: { $regex: listReviewsDto.search, $options: 'i' } },
      ];

      if (residenceResults.length > 0) {
        const reviewIds = residenceResults.map((result) => result._id);
        filter.$or.push({ _id: { $in: reviewIds } });
      }
    }

    const sort: any = {};
    if (listReviewsDto.ratingSort) {
      sort.overallRating = listReviewsDto.ratingSort === RatingSortType.HIGHEST ? -1 : 1;
    }

    if (listReviewsDto.sortBy) {
      sort[listReviewsDto.sortBy] = listReviewsDto.sortOrder === 'asc' ? 1 : -1;
    }

    if (Object.keys(sort).length === 0) {
      sort.createdAt = -1;
    }

    const options = {
      ...PaginationService.prepareOptions(listReviewsDto),
      sort,
    };

    const { data, count, avgOverallRating } = await this.customerReviewRepository.findAllReviews(
      filter,
      options
    );
    const { pagination } = PaginationService.paginate({ rows: data, count }, listReviewsDto);

    return {
      pagination,
      avgOverallRating: parseFloat(avgOverallRating.toFixed(1)),
      reviews: data,
    };
  }

  async getReviewsByResidence(residenceId: string, getResidenceReviewsDto: GetResidenceReviewsDto) {
    const { search, ratingSort, sortBy, sortOrder } = getResidenceReviewsDto;

    const filter: any = {
      residence: new Types.ObjectId(residenceId),
    };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};

    if (ratingSort) {
      switch (ratingSort) {
        case RatingSortType.HIGHEST:
          sort.overallRating = -1;
          break;
        case RatingSortType.LOWEST:
          sort.overallRating = 1;
          break;
      }
    }

    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    if (Object.keys(sort).length === 0) {
      sort.createdAt = -1;
    }

    const options = {
      ...PaginationService.prepareOptions(getResidenceReviewsDto),
      sort,
    };

    const { data, count } = await this.customerReviewRepository.findAllReviews(filter, options);
    console.log(count);
    const { pagination } = PaginationService.paginate(
      { rows: data, count },
      getResidenceReviewsDto
    );

    return {
      pagination,
      reviews: data,
    };
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

  async fetchGoogleReviews(placeId: string): Promise<any[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.GOOGLE_PLACE_API_KEY}`;
      const response = await this.httpService.axiosRef.get(url);

      if (response.data.status !== 'OK' || !response.data.result?.reviews) {
        return [];
      }

      return response.data.result.reviews;
    } catch (error) {
      return [];
    }
  }

  async summarizeReviews(reviews: any[]): Promise<{ summary: string; rating: number }> {
    const reviewText = reviews.map((r) => r.text).join('\n');
    const openAiUrl = process.env.OPENAI_URI;
    const prompt = `
      Craft a concise, personal review of this location as if you're a traveler sharing insights with a friend.
      Capture the essence of the experience, highlighting unique aspects and overall impression.
      Provide a genuine, conversational summary that feels authentic and helpful.
      Format your response as a JSON object with 'rating' and 'summary' keys.

      Example Format:
      {
        "rating": 4.6,
        "summary": "Friendly description that sounds like a real traveler's recommendation"
      }

      Reviews to consider:
      ${reviewText}
    `;

    const response = await this.httpService.axiosRef.post(
      openAiUrl,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      }
    );

    const content = response.data.choices[0]?.message?.content || '';
    let rating = 0;
    let summary = '';

    const parsedResponse = JSON.parse(content);
    rating = parsedResponse.rating || 0;
    summary = parsedResponse.summary || '';

    return { summary, rating };
  }

  async processReviewsForResidence(residenceId: string, placeId: string): Promise<void> {
    const reviews = await this.fetchGoogleReviews(placeId);

    if (reviews.length > 0) {
      const { summary, rating } = await this.summarizeReviews(reviews);

      const filter = { placeId };
      const updateDto = {
        residenceId: new Types.ObjectId(residenceId),
        placeId,
        reviewSummary: summary,
        rating,
        updatedAt: new Date(),
      };

      await this.googleReviewRepository.upsert(filter, updateDto);
    }
  }

  async processAllReviews(): Promise<void> {
    const residences = await this.residenceService.getAllResidences({
      select: { _id: true },
    });

    for (const residence of residences.data) {
      if (residence?.placeId) {
        await this.processReviewsForResidence(residence._id.toString(), residence.placeId);
      }
    }
  }

  async getReviewsForResidence(residenceId: string) {
    const foundResidence = await this.residenceService.getResidenceById(residenceId.toString());

    if (!foundResidence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    let foundReview = await this.googleReviewRepository.find({
      residenceId: new Types.ObjectId(residenceId),
    });

    if (!foundReview) {
      if (!foundResidence?.placeId) {
        throw new NotFoundException(`PlaceId not found for residence with ID ${residenceId}`);
      }
      await this.processReviewsForResidence(residenceId, foundResidence.placeId);

      foundReview = await this.googleReviewRepository.find({
        residenceId: new Types.ObjectId(residenceId),
      });
    }
    return foundReview;
  }
}
