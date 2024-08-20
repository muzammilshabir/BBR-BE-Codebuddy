import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../users/enum/user.enum';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators/getCurrentUser.decorator';
import { Refresh } from './decorators/refresh.decorator';
import { LoginDto, loginSchema } from './dto/login.dto';
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
} from './dto/updateProfile';
import { VerifyUserDto, verifyUserSchema } from './dto/verifyUser.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { JwtPayloadType } from './type/jwt-payload.type';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(AtGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/buyer/login/email')
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async loginWithEmailPassword(@Body() loginDto: LoginDto) {
    const response = await this.authService.loginWithEmailPassword(loginDto, UserRole.BUYER);
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
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async sellerLoginWithEmailPassword(@Body() loginDto: LoginDto) {
    const response = await this.authService.loginWithEmailPassword(loginDto, UserRole.SELLER);
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
}
