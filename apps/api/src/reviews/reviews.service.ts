import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReviewRepository } from './reviews.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Review } from './schema/reviews.schema';
import { CreateReviewDto } from './dto/create-reviews.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { BulkMark, DeletionStatus } from './enum/review-enum';

@Injectable()
export class ReviewService {
  
  private convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)
  
    return array.map(it => {
      return Object.values(it).toString()
    }).join('\n')
  }

  constructor(private readonly reviewRepository: ReviewRepository) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const transformedDto = {
      ...createReviewDto,
      residenceId: new Types.ObjectId(createReviewDto.residenceId),
      photos: createReviewDto.photos.map(
        (photo) => new Types.ObjectId(photo)
      ),
    };
    return await this.reviewRepository.create(transformedDto);
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
      residenceId: new Types.ObjectId(listReviewsDto.residenceId),
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
      residenceId: new Types.ObjectId(residenceId),
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
}
