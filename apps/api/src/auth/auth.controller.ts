import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { CaptchaEnum } from '@bbr/api-core/modules/types/captcha.type';
import { Body, Controller, Get, Ip, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CaptchaGuard } from '../captcha/guards/captcha.guard';
import { UserRole } from '../users/enum/user.enum';
import { AuthService } from './auth.service';
import { GetCurrentUser } from './decorators/getCurrentUser.decorator';
import { Public } from './decorators/public.decorator';
import { Refresh } from './decorators/refresh.decorator';
import { LoginDto, loginSchema } from './dto/login.dto';
import {
  ResendVerificationEmailDto,
  resendVerificationEmailSchema,
} from './dto/resendVerificationEmail';
import { BuyerSignupDto, buyerSignupSchema } from './dto/signup.dto';
import { UpdateBuyerProfileDto, updateBuyerProfileSchema } from './dto/updateProfile';
import { VerifyUserDto, verifyUserSchema } from './dto/verifyUser.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { JwtPayloadType } from './type/jwt-payload.type';

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

    return ResponseService.buildResponse({ tokens });
  }
}
