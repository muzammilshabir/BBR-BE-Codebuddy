import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerReviewsService } from './customer-reviews.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { JoiValidationPipe } from '../../../../packages/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { ResponseService } from '../../../../packages/api-core/modules/response/response.service';
import { RequestReviewDto, requestReviewDtoSchema } from './dto/request-review.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CreateReviewDto, createReviewDtoSchema } from './dto/create-review.dto';
import { DeleteReviewsDto, deleteReviewsDtoSchema } from './dto/delete-reviews.dto';
import { ListReviewsDto, listReviewsSchema } from './dto/list-reviews.dto';
import { GetReviewByIdDto, getReviewByIdSchema } from './dto/get-review-by-id.dto';
import {
  GetResidenceReviewsDto,
  getResidenceReviewsSchema,
  residenceIdSchema,
  ResidenceIdSchemaDto,
} from './dto/get-reviews-by-residenceId.dto';

@ApiTags('Customer-Review')
@Controller('customer-reviews')
export class CustomerReviewsController {
  constructor(private readonly customerReviewsService: CustomerReviewsService) {}

  @Post('/request-review')
  @ApiOperation({
    summary: 'Request Review from buyer',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(requestReviewDtoSchema, 'body'))
  async requestReview(
    @GetCurrentUser() userFromToken: JwtPayloadType,
    @Body() requestReviewDto: RequestReviewDto
  ) {
    const result = await this.customerReviewsService.requestReview(userFromToken, requestReviewDto);
    return ResponseService.buildResponse({ result }, 'Review requested successfully');
  }

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Create Review for a residence',
  })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(createReviewDtoSchema, 'body'))
  async create(@Body() createReviewDto: CreateReviewDto) {
    const review = await this.customerReviewsService.create(createReviewDto);
    return ResponseService.buildResponse({ review }, 'Review created successfully');
  }

  @Get('test-reviews')
  @Public()
  @ApiOperation({
    summary: 'test google review',
  })
  async testReviews() {
    const placeIds = [
      'ChIJs5ydyTiuEmsR0fRSlU0C7k0',
      'ChIJpyiwa4Zw44kRBQSGWKv4wgM',
      'ChIJpyiwa4Zw44kRBQSGWKv4wgA',
    ];

    await this.customerReviewsService.testReviewFetching(placeIds);
  }

  @Get('/')
  @ApiOperation({
    summary: 'List Reviews with filters and pagination',
  })
  @Public()
  @UsePipes(new JoiValidationPipe(listReviewsSchema, 'query'))
  async listReviews(@Query() query: ListReviewsDto) {
    const result = await this.customerReviewsService.listReviews(query);
    return ResponseService.buildResponse(result, 'Reviews retrieved successfully');
  }

  @Get('/stats/:id')
  @ApiOperation({
    summary: 'Get Review stats for single Review',
  })
  @ApiBearerAuth()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getReviewByIdSchema, 'param'))
  async getStatsById(@Param() params: GetReviewByIdDto) {
    const reviewStats = await this.customerReviewsService.getReviewById(params.id);
    return ResponseService.buildResponse({ reviewStats }, 'Review Stats retrieved successfully');
  }

  @Get('/:residenceId')
  @ApiOperation({
    summary: 'Get Reviews by Residence ID with filters',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(
    new JoiValidationPipe(getResidenceReviewsSchema, 'query'), // Query validation
    new JoiValidationPipe(residenceIdSchema, 'param') // Param validation
  )
  async getReviewsByResidence(
    @Param() residenceIdSchemaDto: ResidenceIdSchemaDto,
    @Query() getResidenceReviewsDto: GetResidenceReviewsDto
  ) {
    const reviews = await this.customerReviewsService.getReviewsByResidence(
      residenceIdSchemaDto.residenceId,
      getResidenceReviewsDto
    );
    return ResponseService.buildResponse(reviews, 'Reviews retrieved successfully');
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete review by ids',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(deleteReviewsDtoSchema, 'body'))
  async deleteReview(
    @GetCurrentUser() userFromToken: JwtPayloadType,
    @Body() deleteReviewsDto: DeleteReviewsDto
  ) {
    await this.customerReviewsService.deleteReviews(deleteReviewsDto);
    return ResponseService.buildResponse('Review deleted successfully');
  }

  @Get('google-review/:residenceId')
  @Public()
  @ApiOperation({
    summary: 'Get google review by residenceId',
  })
  @UsePipes(new JoiValidationPipe(residenceIdSchema, 'param'))
  async getReviews(@Param() residenceIdDto: ResidenceIdSchemaDto) {
    return this.customerReviewsService.getReviewsForResidence(residenceIdDto.residenceId);
  }
}
