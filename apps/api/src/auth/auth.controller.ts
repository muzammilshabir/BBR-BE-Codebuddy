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
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CaptchaGuard } from '../captcha/guards/captcha.guard';
import { UserRole } from '../users/enum/user.enum';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators/getCurrentUser.decorator';
import { Public } from './decorators/public.decorator';
import { Refresh } from './decorators/refresh.decorator';
import { LoginDto, loginSchema, ThirdPartyLoginDto, thirdPartyLoginSchema } from './dto/login.dto';
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
  AddStaffMemberDto,
  addStaffMemberSchema,
  BuyerSignupDto,
  buyerSignupSchema,
  ClaimSellerDto,
  claimSellerSchema,
  SellerSignupDto,
  sellerSignupSchema,
} from './dto/signup.dto';
import {
  AcceptBBRCommitment,
  acceptBBRCommitmentSchema,
  UpdateBuyerProfileDto,
  updateBuyerProfileSchema,
  UpdateUserStatusDto,
  UpdateUserStatusSchema,
  UpdateSellerProfileDto,
  updateSellerProfileSchema,
  UpdateStaffMemberDto,
  updateStaffMemberSchema,
  UpdateSellerByIdDto,
  updateSellerByIdSchema,
  ResetPasswordByIdDto,
  resetPasswordByIdSchema,
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
  RemoveFavouritesDto,
  removeFavouritesSchema,
} from './dto/addToFavourite';
import { GetCurrentUserId } from './decorators/getCurrentUserId.decorator';
import { GetUserByIdDto, getUserByIdSchema } from './dto/getUserById.dto';
import { ListAdminsDto, listAdminsSchema, ListUserDto, listUserSchema } from './dto/listUsers';
import { AddSellerDto, AddSellerSchema } from '../users/dto/createUser.dto';
import { Roles } from './decorators/roles.decorator';
import { ChangeEmailDto, changeEmailSchema } from './dto/changeEmail.dto';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(AtGuard)
@ApiSecurity('x-api-key')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'return logged in user details',
  })
  @Get('/me')
  async me(@GetCurrentUser() userFromToken: JwtPayloadType) {
    const user = await this.authService.me(userFromToken);
    return ResponseService.buildResponse({ user });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get buyer by ID',
  })
  @Get('buyer/:id')
  @UsePipes(new JoiValidationPipe(getUserByIdSchema, 'param'))
  async getBuyerById(@Param() params: GetUserByIdDto) {
    const buyer = await this.authService.getBuyerById(params.id);
    return ResponseService.buildResponse(buyer, 'Buyer retrieved successfully');
  }

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
    const response = await this.authService.loginWithEmailPassword(loginDto, ip, UserRole.BUYER);
    return ResponseService.buildResponse(response);
  }

  @ApiOperation({
    summary: 'Get all admins login in last 24 hours',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('logged-in-last-24-hours')
  async getUsersLoggedInLast24Hours() {
    const admins = await this.authService.getUsersLoggedInLast24Hours();
    return ResponseService.buildResponse(admins, 'admins fetched successfully');
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

  @Get('google')
  @Public()
  @ApiOperation({
    summary:
      'Call this url with id_token to generate token after successful authentication by google internally',
  })
  @UsePipes(new JoiValidationPipe(thirdPartyLoginSchema, 'query'))
  async googleAuth(@Query() query: ThirdPartyLoginDto) {
    const response = await this.authService.handleGoogleAuth(query);
    return ResponseService.buildResponse({ response });
  }

  @Public()
  @ApiOperation({
    summary:
      'Call this url with linkedIn access_token to generate token after successful authentication by linkedIn internally',
  })
  @Get('linkedIn')
  @UsePipes(new JoiValidationPipe(thirdPartyLoginSchema, 'query'))
  async handleLinkedInAuth(@Query() query: ThirdPartyLoginDto) {
    const response = await this.authService.handleLinkedInAuth(query);
    return ResponseService.buildResponse({ response });
  }

  @ApiOperation({
    summary:
      'Call this url with fb access_token to generate token after successful authentication by facebook internally',
  })
  @Public()
  @Get('facebook')
  @UsePipes(new JoiValidationPipe(thirdPartyLoginSchema, 'query'))
  async fbAuth(@Query() query: ThirdPartyLoginDto) {
    const response = await this.authService.handleFbAuth(query);
    return ResponseService.buildResponse({ response });
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
    const user = await this.authService.updateBuyer(userFromToken.sub, buyerSignupDto);
    return ResponseService.buildResponse(user, 'Buyer updated successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Buyer Profile',
  })
  @Patch('buyer/:id')
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(getUserByIdSchema, 'param'))
  @UsePipes(new JoiValidationPipe(updateBuyerProfileSchema, 'body'))
  async updateBuyerById(
    @Param() params: GetUserByIdDto,
    @Body() buyerSignupDto: UpdateBuyerProfileDto
  ) {
    const user = await this.authService.updateBuyer(params.id, buyerSignupDto);
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

  // Create a change email if wrong is enter for verification
  @ApiOperation({
    summary: 'Change email',
  })
  @Public()
  @Post('/change-email')
  @UsePipes(new JoiValidationPipe(changeEmailSchema, 'body'))
  async changeEmail(@Body() changeEmailDto: ChangeEmailDto) {
    const response = await this.authService.changeEmail(changeEmailDto);
    return ResponseService.buildResponse(response, 'Email changed successfully');
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
  @Roles(UserRole.BUYER, UserRole.SELLER)
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
  @Roles(UserRole.BUYER, UserRole.SELLER)
  @Patch('buyer/favourites/remove')
  @UsePipes(new JoiValidationPipe(removeFavouritesSchema, 'body'))
  @ApiOperation({ summary: 'Remove favourites (unit/residence)' })
  async removeFavourites(
    @GetCurrentUserId() userId: string,
    @Body() removeFavouritesDto: RemoveFavouritesDto
  ) {
    const user = await this.authService.removeFavourites(userId, removeFavouritesDto);
    return ResponseService.buildResponse({ user }, 'Favourites removed successfully');
  }

  @ApiBearerAuth()
  @Get('favourites')
  @Roles(UserRole.BUYER)
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
    const response = await this.authService.loginWithEmailPassword(loginDto, ip, UserRole.SELLER);
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

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('seller/update-status/:id/:status')
  @ApiOperation({ summary: 'Update Seller status' })
  async updateSellerStatus(
    @Param(new JoiValidationPipe(UpdateUserStatusSchema, 'param'))
    params: UpdateUserStatusDto
  ) {
    const { id, status } = params;
    const result = await this.authService.updateSellerStatus({ id, status });
    return { message: 'Seller status updated successfully', data: result };
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add new Seller Profile',
  })
  @Patch('seller/add')
  @UsePipes(new JoiValidationPipe(AddSellerSchema, 'body'))
  async addSeller(@Body() addSellerDto: AddSellerDto) {
    const user = await this.authService.addSeller(addSellerDto);
    return ResponseService.buildResponse(user, 'Seller added successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Seller by ID' })
  @Patch('seller/:id')
  @UsePipes(new JoiValidationPipe(updateSellerByIdSchema, 'body'))
  async updateSellerById(
    @Param('id') sellerId: string,
    @Body() updateSellerByIdDto: UpdateSellerByIdDto
  ) {
    const updatedSeller = await this.authService.updateSellerById(sellerId, updateSellerByIdDto);
    return ResponseService.buildResponse(updatedSeller, 'Seller updated successfully');
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

  @ApiOperation({
    summary: 'Verify Admin by email flow',
  })
  @Public()
  @Post('/admin/verify')
  @UsePipes(new JoiValidationPipe(verifyUserSchema, 'body'))
  async verifyAdmin(@Body() verifySellerDto: VerifyUserDto) {
    const tokens = await this.authService.verifyUser(verifySellerDto, UserRole.ADMIN);

    return ResponseService.buildResponse(tokens, 'Admin verified successfully');
  }

  @Post('/admin/login/email')
  @Public()
  @ApiHeader({
    name: CaptchaEnum.HEADER,
    required: false,
    description: 'Send captcha token with this header, when getting captcha error',
  })
  @UseGuards(CaptchaGuard)
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async adminLoginWithEmailPassword(@Body() loginDto: LoginDto, @Ip() ip: string) {
    const response = await this.authService.loginWithEmailPassword(loginDto, ip, UserRole.ADMIN);
    return ResponseService.buildResponse(response);
  }

  @ApiOperation({
    summary: 'Add staff member',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post('/admin/staff-member/add')
  @UsePipes(new JoiValidationPipe(addStaffMemberSchema, 'body'))
  async addStaffMember(
    @Body() addStaffMemberDto: AddStaffMemberDto,
    @GetCurrentUserId() userId: string
  ) {
    const user = await this.authService.addStaffMember(addStaffMemberDto, userId);
    return ResponseService.buildResponse({ user }, 'staffMember added successfully');
  }

  @ApiOperation({
    summary: 'Update staff member',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('/admin/staff-member/update')
  @UsePipes(new JoiValidationPipe(updateStaffMemberSchema, 'body'))
  async updateStaffMember(
    @Body() updateStaffMemberDto: UpdateStaffMemberDto,
    @GetCurrentUserId() userId: string
  ) {
    const updatedUser = await this.authService.updateStaffMember(updateStaffMemberDto, userId);
    return ResponseService.buildResponse({ updatedUser }, 'Staff member updated successfully');
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch('admin/update-status/:id/:status')
  @ApiOperation({ summary: 'Update staffMember status' })
  async updateStaffMemberStatus(
    @Param(new JoiValidationPipe(UpdateUserStatusSchema, 'param'))
    params: UpdateUserStatusDto
  ) {
    const { id, status } = params;
    const result = await this.authService.updateStaffMemberStatus({ id, status });
    return { message: 'staffMember status updated successfully', data: result };
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get Staff member by ID',
  })
  @Get('/admin/staff-member/:id')
  @UsePipes(new JoiValidationPipe(getUserByIdSchema, 'param'))
  async getStaffMemberById(@Param() params: GetUserByIdDto) {
    const seller = await this.authService.getStaffMemberById(params.id);
    return ResponseService.buildResponse(seller, 'Seller retrieved successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List admins',
  })
  @Get('/admin/staff-member')
  @UsePipes(new JoiValidationPipe(listAdminsSchema, 'param'))
  async listAdmins(@Query() query: ListAdminsDto) {
    const admins = await this.authService.listAdmins(query);
    return ResponseService.buildResponse(admins, 'admins retrieved successfully');
  }

  @Patch('/reset-password')
  @ApiOperation({
    summary: 'Reset password by id',
  })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @UsePipes(new JoiValidationPipe(resetPasswordByIdSchema, 'body'))
  async rejectResidence2(
    @GetCurrentUserId() userId: string,
    @Body() resetPasswordByIdDto: ResetPasswordByIdDto
  ) {
    const user = await this.authService.resetStaffMemberPassword(resetPasswordByIdDto, userId);
    return ResponseService.buildResponse({ user }, 'Password reset successfully');
  }

  @Post('/claim-seller')
  @Public()
  @UsePipes(new JoiValidationPipe(claimSellerSchema, 'body'))
  async claimSeller(@Body() claimSellerDto: ClaimSellerDto) {
    const user = await this.authService.handleClaimSeller(claimSellerDto);
    return ResponseService.buildResponse(
      { user },
      'User details updated successfully, verification email sent'
    );
  }
}
