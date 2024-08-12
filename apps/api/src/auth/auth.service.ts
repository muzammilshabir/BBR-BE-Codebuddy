import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignupMethod, UserRole, UserType } from '../users/enum/user.enum';
import { UserService } from '../users/user.service';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail';
import { BuyerSignupDto } from './dto/signup.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async signupBuyer(buyerSignupDto: BuyerSignupDto) {
    return await this.userService.create({
      fullName: buyerSignupDto.fullName,
      email: buyerSignupDto.email,
      password: buyerSignupDto.password,
      agreeToTerms: true,
      signupMethod: SignupMethod.EMAIL,
      userType: UserType.Buyer,
      role: UserRole.BUYER,
    });
  }

  async verifyUser(verifyUserDto: VerifyUserDto, userType: UserType) {
    const { email, token } = verifyUserDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ForbiddenException('Email or token is invalid');
    }

    return await this.userService.verifyUserEmail(token, email, userType);
  }

  async resendVerificationEmail(resendVerificationEmailDo: ResendVerificationEmailDto) {
    const user = await this.userService.findByEmail(resendVerificationEmailDo.email);

    if (user && !user.isVerified) {
      await this.userService.resendVerificationEmail(user);
    }
  }
}
