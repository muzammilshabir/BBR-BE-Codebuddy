import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
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
import { BuyerSignupDto, buyerSignupSchema } from './dto/signup.dto';
import { VerifyUserDto, verifyUserSchema } from './dto/verifyUser.dto';
import { RtGuard } from './guards/rt.guard';
import { JwtPayloadType } from './type/jwt-payload.type';

@ApiTags('Auth')
@Controller('auth')
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
  @Post('/buyer/signup')
  @UsePipes(new JoiValidationPipe(buyerSignupSchema, 'body'))
  async signupBuyer(@Body() buyerSignupDto: BuyerSignupDto) {
    const user = await this.authService.signupBuyer(buyerSignupDto);
    return ResponseService.buildResponse({ user }, 'Buyer signed up successfully');
  }

  @ApiOperation({
    summary: 'Verify Buyer',
  })
  @Post('/buyer/verify')
  @UsePipes(new JoiValidationPipe(verifyUserSchema, 'body'))
  async verifyBuyer(@Body() verifyBuyerDto: VerifyUserDto) {
    const tokens = await this.authService.verifyUser(verifyBuyerDto, UserRole.BUYER);

    return ResponseService.buildResponse({ tokens }, 'Buyer verified successfully');
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

    return ResponseService.buildResponse({ tokens });
  }
}
