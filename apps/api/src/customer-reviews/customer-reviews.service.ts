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
import { ListReviewsDto, RatingSortType } from './dto/list-reviews.dto';
import { PaginationService } from '../../../../packages/api-core/modules/pagination/pagination.service';
import { Types } from 'mongoose';
import { GetResidenceReviewsDto } from './dto/get-reviews-by-residenceId.dto';
import { GoogleReviewRepository } from './google-reviews.repository';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CustomerReviewsService {
  constructor(
    private readonly residenceService: ResidenceService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly customerReviewRepository: CustomerReviewRepository,
    private readonly googleReviewRepository: GoogleReviewRepository,
    private readonly httpService: HttpService
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
        process.env.REVIEW_FRONTEND_URL
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
      developer: new Types.ObjectId(residence.createdById),
      displayId,
      ...(createReviewDto.photos && {
        photos: createReviewDto.photos.map((photo) => new Types.ObjectId(photo)),
      }),
    };

    const createdReview = await this.customerReviewRepository.create(transformedDto);

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

  async listReviews(listReviewsDto: ListReviewsDto) {
    const filter: any = {
      isDeleted: false,
    };

    if (listReviewsDto.developerIds?.length) {
      filter.developer = {
        $in: listReviewsDto.developerIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (listReviewsDto.search) {
      filter.$or = [
        { fullName: { $regex: listReviewsDto.search, $options: 'i' } },
        { email: { $regex: listReviewsDto.search, $options: 'i' } },
        { phoneNumber: { $regex: listReviewsDto.search, $options: 'i' } },
      ];

      const residenceResults = await this.customerReviewRepository.aggregate(listReviewsDto.search);

      if (residenceResults.length > 0) {
        const reviewIds = residenceResults.map((result) => result._id);
        filter.$or.push({ _id: { $in: reviewIds } });
      }
    }
    const sort: any = {};

    if (listReviewsDto.ratingSort) {
      switch (listReviewsDto.ratingSort) {
        case RatingSortType.HIGHEST:
          sort.overallRating = -1;
          break;
        case RatingSortType.LOWEST:
          sort.overallRating = 1;
          break;
      }
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

    const { data, count } = await this.customerReviewRepository.findAllReviews(filter, options);
    const { pagination } = PaginationService.paginate({ rows: data, count }, listReviewsDto);

    return {
      pagination,
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
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.GOOGLE_PLACE_API_KEY}`;
    const response = await this.httpService.axiosRef.get(url);
    return response.data.result.reviews || [];
  }

  async summarizeReviews(reviews: any[]): Promise<{ summary: string; rating: number }> {
    const reviewText = reviews.map((r) => r.text).join('\n');
    const openAiUrl = 'https://api.openai.com/v1/chat/completions';
    const prompt = `
      Summarize the following Google reviews and provide an overall star rating (1-5):
      Reviews:
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
    const starRatingMatch = content.match(/(\d+(\.\d+)?)\s*stars/);
    const rating = starRatingMatch ? parseFloat(starRatingMatch[1]) : 0;

    return { summary: content, rating };
  }

  async processReviewsForResidence(residenceId: string, placeId: string): Promise<void> {
    const reviews = await this.fetchGoogleReviews(placeId);

    if (reviews.length > 0) {
      const { summary, rating } = await this.summarizeReviews(reviews);

      const filter = { placeId };
      const updateDto = {
        residenceId,
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
      select: { _id: true, placeId: true },
    });

    for (const residence of residences) {
      await this.processReviewsForResidence(residence.id, residence.placeId);
    }
  }

  async getReviewsForResidence(residenceId: string) {
    const foundResidence = await this.residenceService.getResidenceById(residenceId);

    if (!foundResidence) {
      throw new NotFoundException(`Residence with ID ${residenceId} not found`);
    }

    let foundReview = await this.googleReviewRepository.find({ where: { residenceId } });

    if (!foundReview) {
      await this.processReviewsForResidence(residenceId, foundResidence.placeId);
      foundReview = await this.googleReviewRepository.find({ where: { residenceId } });
    }
    return foundReview;
  }
}
