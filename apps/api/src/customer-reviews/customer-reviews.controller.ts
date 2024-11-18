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
  async getStatsByResidenceId(@Param() params: GetReviewByIdDto) {
    const reviewStats = await this.customerReviewsService.getReviewById(params.id);
    return ResponseService.buildResponse({ reviewStats }, 'Review Stats retrieved successfully');
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
}
