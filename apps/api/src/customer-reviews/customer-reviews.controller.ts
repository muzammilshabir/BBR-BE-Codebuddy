import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerReviewsService } from './customer-reviews.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { JoiValidationPipe } from '../../../../packages/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { ResponseService } from '../../../../packages/api-core/modules/response/response.service';
import { RequestReviewDto, requestReviewDtoSchema } from './dto/request-review.dto';

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
}
