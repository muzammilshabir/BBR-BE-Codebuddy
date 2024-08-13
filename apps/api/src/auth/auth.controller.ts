import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../users/enum/user.enum';
import { AuthService } from './auth.service';
import {
  ResendVerificationEmailDto,
  resendVerificationEmailSchema,
} from './dto/resendVerificationEmail';
import { BuyerSignupDto, buyerSignupSchema } from './dto/signup.dto';
import { VerifyUserDto, verifyUserSchema } from './dto/verifyUser.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Buyer Signup',
  })
  @Post('/buyer/signup')
  @UsePipes(new JoiValidationPipe(buyerSignupSchema, 'body'))
  async signupBuyer(@Body() buyerSignupDto: BuyerSignupDto) {
    const newUser = await this.authService.signupBuyer(buyerSignupDto);
    return ResponseService.buildResponse(newUser, 'Buyer signed up successfully');
  }

  @ApiOperation({
    summary: 'Verify Buyer',
  })
  @Post('/buyer/verify')
  @UsePipes(new JoiValidationPipe(verifyUserSchema, 'body'))
  async verifyBuyer(@Body() verifyBuyerDto: VerifyUserDto) {
    const tokens = await this.authService.verifyUser(verifyBuyerDto, UserRole.BUYER);

    return ResponseService.buildResponse(tokens, 'Buyer verified successfully');
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
}
