import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { CaptchaEnum } from '@bbr/api-core/modules/types/captcha.type';
import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CaptchaGuard } from '../captcha/guards/captcha.guard';
import { UserRole } from '../users/enum/user.enum';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators/getCurrentUser.decorator';
import { Public } from './decorators/public.decorator';
import { Refresh } from './decorators/refresh.decorator';
import { LoginDto, loginSchema } from './dto/login.dto';
import {
  ChangePasswordDto,
  changePasswordSchema,
  ForgotPasswordDto,
  forgotPasswordSchema,
  ResetPasswordDto,
  resetPasswordSchema,
} from './dto/passwordReset.dto';
import {
  ResendVerificationEmailDto,
  resendVerificationEmailSchema,
} from './dto/resendVerificationEmail';
import {
  BuyerSignupDto,
  buyerSignupSchema,
  SellerSignupDto,
  sellerSignupSchema,
} from './dto/signup.dto';
import {
  AcceptBBRCommitment,
  acceptBBRCommitmentSchema,
  UpdateBuyerProfileDto,
  updateBuyerProfileSchema,
  UpdateSellerProfileDto,
  updateSellerProfileSchema,
} from './dto/updateProfile';
import { VerifyUserDto, verifyUserSchema } from './dto/verifyUser.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { JwtPayloadType } from './type/jwt-payload.type';
import {
  AddFavouritesDto,
  addFavouritesSchema,
  getFavouritesSchema,
  ListFavouritesDto,
} from './dto/addToFavourite';
import { GetCurrentUserId } from './decorators/getCurrentUserId.decorator';
import { GetUserByIdDto, getUserByIdSchema } from './dto/getUserById.dto';
import { ListUserDto, listUserSchema } from './dto/listUsers';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(AtGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Buyer Login',
  })
  @ApiHeader({
    name: CaptchaEnum.HEADER,
    required: false,
    description: 'Send captcha token with this header, when getting captcha error',
  })
  @Public()
  @Post('/buyer/login/email')
  @UseGuards(CaptchaGuard)
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async loginWithEmailPassword(@Body() loginDto: LoginDto, @Ip() ip: string) {
    const response = await this.authService.loginWithEmailPassword(loginDto, UserRole.BUYER, ip);
    return ResponseService.buildResponse(response);
  }

  @ApiOperation({
    summary: 'Buyer Signup',
  })
  @Public()
  @Post('/buyer/signup')
  @UsePipes(new JoiValidationPipe(buyerSignupSchema, 'body'))
  async signupBuyer(@Body() buyerSignupDto: BuyerSignupDto) {
    const user = await this.authService.signupBuyer(buyerSignupDto);
    return ResponseService.buildResponse({ user }, 'Buyer signed up successfully');
  }

  @ApiOperation({
    summary: 'Verify Buyer',
  })
  @Public()
  @Post('/buyer/verify')
  @UsePipes(new JoiValidationPipe(verifyUserSchema, 'body'))
  async verifyBuyer(@Body() verifyBuyerDto: VerifyUserDto) {
    const tokens = await this.authService.verifyUser(verifyBuyerDto, UserRole.BUYER);

    return ResponseService.buildResponse({ tokens }, 'Buyer verified successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Buyer Profile',
  })
  @Patch('buyer/me')
  @UsePipes(new JoiValidationPipe(updateBuyerProfileSchema, 'body'))
  async updateBuyer(
    @GetCurrentUser() userFromToken: JwtPayloadType,
    @Body() buyerSignupDto: UpdateBuyerProfileDto
  ) {
    const user = await this.authService.updateBuyer(userFromToken, buyerSignupDto);
    return ResponseService.buildResponse(user, 'Buyer updated successfully');
  }

  @ApiOperation({
    summary: 'Resend Verification Email',
  })
  @Public()
  @Post('/resend-verification-email')
  @UsePipes(new JoiValidationPipe(resendVerificationEmailSchema, 'body'))
  async resendVerificationEmail(@Body() resendVerificationEmailDo: ResendVerificationEmailDto) {
    await this.authService.resendVerificationEmail(resendVerificationEmailDo);

    return ResponseService.buildResponse({}, 'Verification email sent successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh token',
  })
  @Refresh()
  @Get('refresh')
  @UseGuards(RtGuard)
  async refresh(@GetCurrentUser() userFromToken: JwtPayloadType) {
    const tokens = await this.authService.refreshToken(userFromToken);

    return ResponseService.buildResponse(tokens);
  }

  @ApiBearerAuth()
  @Patch('buyer/favourites/add')
  @UsePipes(new JoiValidationPipe(addFavouritesSchema, 'body'))
  @ApiOperation({ summary: 'Add favourites (unit/residence)' })
  async addFavourites(
    @GetCurrentUserId() userId: string,
    @Body() addFavouritesDto: AddFavouritesDto
  ) {
    const user = await this.authService.addFavourites(userId, addFavouritesDto);
    return ResponseService.buildResponse({ user }, 'Favourites updated successfully');
  }

  @ApiBearerAuth()
  @Get('buyer/favourites')
  @UsePipes(new JoiValidationPipe(getFavouritesSchema, 'param'))
  @ApiOperation({ summary: 'Get favourite residences or units' })
  async getFavourites(@GetCurrentUserId() userId: string, @Query() query: ListFavouritesDto) {
    const favourites = await this.authService.getFavourites(userId, query);
    return ResponseService.buildResponse(favourites, 'Favourites retrieved successfully');
  }

  @ApiOperation({
    summary: 'Seller Signup',
  })
  @Public()
  @Post('/seller/signup')
  @UsePipes(new JoiValidationPipe(sellerSignupSchema, 'body'))
  async signupSeller(@Body() sellerSignupDto: SellerSignupDto) {
    const user = await this.authService.signupDeveloper(sellerSignupDto);
    return ResponseService.buildResponse({ user }, 'Seller signed up successfully');
  }

  @ApiOperation({
    summary: 'Verify Seller',
  })
  @Public()
  @Post('/seller/verify')
  @UsePipes(new JoiValidationPipe(verifyUserSchema, 'body'))
  async verifySeller(@Body() verifySellerDto: VerifyUserDto) {
    const tokens = await this.authService.verifyUser(verifySellerDto, UserRole.SELLER);

    return ResponseService.buildResponse(tokens, 'Seller verified successfully');
  }

  @Post('/seller/login/email')
  @Public()
  @ApiHeader({
    name: CaptchaEnum.HEADER,
    required: false,
    description: 'Send captcha token with this header, when getting captcha error',
  })
  @UseGuards(CaptchaGuard)
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async sellerLoginWithEmailPassword(@Body() loginDto: LoginDto, @Ip() ip: string) {
    const response = await this.authService.loginWithEmailPassword(loginDto, UserRole.SELLER, ip);
    return ResponseService.buildResponse(response);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept BBR Commitment',
  })
  @Patch('seller/accept-commitment')
  @UsePipes(new JoiValidationPipe(acceptBBRCommitmentSchema, 'body'))
  async acceptBbrCommitment(
    @GetCurrentUser() userDetails: JwtPayloadType,
    @Body() acceptBBRCommitment: AcceptBBRCommitment
  ) {
    const user = await this.authService.acceptBbrCommitment(userDetails, acceptBBRCommitment);
    return ResponseService.buildResponse(user, 'BBR Commitment accepted successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List Sellers',
  })
  @Get('seller')
  @UsePipes(new JoiValidationPipe(listUserSchema, 'param'))
  async listSellers(@Query() query: ListUserDto) {
    const sellers = await this.authService.listSellers(query);
    return ResponseService.buildResponse(sellers, 'Seller retrieved successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get seller by ID',
  })
  @Get('seller/:id')
  @UsePipes(new JoiValidationPipe(getUserByIdSchema, 'param'))
  async getSellerById(@Param() params: GetUserByIdDto) {
    const seller = await this.authService.getSellerById(params.id);
    return ResponseService.buildResponse(seller, 'Seller retrieved successfully');
  }

  @ApiOperation({ summary: 'Request a password reset link' })
  @Public()
  @Post('forgot-password')
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema, 'body'))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return ResponseService.buildResponse({}, 'Password reset link sent successfully');
  }

  @ApiOperation({ summary: 'Reset password using a token' })
  @Public()
  @Post('reset-password')
  @UsePipes(new JoiValidationPipe(resetPasswordSchema, 'body'))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return ResponseService.buildResponse({}, 'Password has been reset successfully');
  }

  @ApiOperation({ summary: 'Send reset password link' })
  @ApiBearerAuth()
  @Post('send-reset-password-link')
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema, 'body'))
  async sendResetPasswordLink(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return ResponseService.buildResponse({}, 'Reset password link sent successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Seller Profile',
  })
  @Patch('seller/me')
  @UsePipes(new JoiValidationPipe(updateSellerProfileSchema, 'body'))
  async updateSeller(
    @GetCurrentUser() userFromToken: JwtPayloadType,
    @Body() updateSellerProfileDto: UpdateSellerProfileDto
  ) {
    const user = await this.authService.updateSeller(userFromToken, updateSellerProfileDto);
    return ResponseService.buildResponse(user, 'Seller updated successfully');
  }

  @ApiOperation({ summary: 'Change password ' })
  @ApiBearerAuth()
  @Patch('change-password')
  @UsePipes(new JoiValidationPipe(changePasswordSchema, 'body'))
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    await this.authService.changePassword(changePasswordDto, user);
    return ResponseService.buildResponse({}, 'Password has been changed successfully');
  }
}
