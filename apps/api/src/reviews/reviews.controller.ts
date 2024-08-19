import { Public } from '@bbr/api-core/modules/decorators';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { Controller, Post, Body, Get, Param, UsePipes, Query, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './reviews.service';
import { CreateReviewDto, createReviewDtoSchema } from './dto/create-reviews.dto';
import { GetReviewByIdDto, getReviewByIdSchema } from './dto/get-review-by-id.dto';
import { ListReviewsDto, listReviewsSchema } from './dto/list-reviews.dto';
import { GetReviewsByResidenceIdDto, getReviewsByResidenceIdSchema } from './dto/get-reviews-by-residence-id.dto';
import { BulkActionReviewDto, bulkActionReviewSchema } from './dto/bulk-action-review.dto';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Review for a residence',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(createReviewDtoSchema, 'body'))
  async create(@Body() createReviewDto: CreateReviewDto) {
    const review = await this.reviewService.create(createReviewDto);
    return ResponseService.buildResponse({ review }, 'Review created successfully');
  }

  @Get(':reviewId')
  @ApiOperation({
    summary: 'Get Review by ID',
  })
  @UsePipes(new JoiValidationPipe(getReviewByIdSchema, 'param'))
  async getReviewById(@Param() params: GetReviewByIdDto) {
    const review = await this.reviewService.getReviewById(params.reviewId);
    return ResponseService.buildResponse({ review }, 'Review retrieved successfully');
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Reviews with residenceId filter',
  })
  @UsePipes(new JoiValidationPipe(listReviewsSchema, 'query'))
  async listReviews(@Query() query: ListReviewsDto) {
    const reviews = await this.reviewService.listReviews(query);
    return ResponseService.buildResponse(reviews);
  }

  @Get('/stats/:residenceId')
  @ApiOperation({
    summary: 'Get Average Rating and Total reviews for single Residence',
  })
  @UsePipes(new JoiValidationPipe(getReviewsByResidenceIdSchema, 'param'))
  async getStatsByResidenceId(@Param() params: GetReviewsByResidenceIdDto) {
    const reviewStats = await this.reviewService.getStatsByResidenceId(params.residenceId);
    return ResponseService.buildResponse({ reviewStats }, 'Review Stats retrieved successfully');
  }

  @Get('/highlights/:residenceId')
  @ApiOperation({
    summary: 'Get Max 3 Highlighted Review by Residence',
  })
  @UsePipes(new JoiValidationPipe(getReviewsByResidenceIdSchema, 'param'))
  async getHighlightedReviewsByResidenceId(@Param() params: GetReviewsByResidenceIdDto) {
    const reviewStats = await this.reviewService.getHighlightedReviewsByResidenceId(params.residenceId);
    return ResponseService.buildResponse({ reviewStats }, 'Reviews retrieved successfully');
  }

  @Get('/export/:residenceId')
  @ApiOperation({
    summary: 'Export reviews as CSV by Residence',
  })
  @UsePipes(new JoiValidationPipe(getReviewsByResidenceIdSchema, 'param'))
  async exportReviewsByResidenceId(@Param() params: GetReviewsByResidenceIdDto) {
    const reviewsCSV = await this.reviewService.exportReviewsByResidenceId(params.residenceId);
    return ResponseService.buildResponse({ reviewsCSV }, 'Reviews retrieved successfully');
  }

  @Put('/flag/:reviewId')
  @ApiOperation({
    summary: 'Flag review',
  })
  @UsePipes(new JoiValidationPipe(getReviewByIdSchema, 'param'))
  async flagReview(
    @Param() params: GetReviewByIdDto,
  ) {
    const review = await this.reviewService.flagReview(
      params.reviewId,
    );
    return ResponseService.buildResponse({ review }, 'Review flagged successfully');
  }

  @Put('/bulk/:residenceId')
  @ApiOperation({
    summary: 'Bulk review marking(Responded, Removal)',
  })
  @UsePipes(new JoiValidationPipe(getReviewsByResidenceIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(bulkActionReviewSchema, 'body'))
  async bulkMarkReviews(
    @Param() params: GetReviewsByResidenceIdDto,
    @Body() body: BulkActionReviewDto,
  ) {
    const result = await this.reviewService.bulkMarking(
      params.residenceId,
      body.reviewIds,
      body.action,
    );
    return ResponseService.buildResponse({ result }, 'Bulk reviews marked successfully');
  }
}
