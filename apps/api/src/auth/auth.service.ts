import { MailerService } from '@bbr/api-core/modules/mailer/mailer.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignupMethod, UserRole } from '../users/enum/user.enum';
import { UserService } from '../users/user.service';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail';
import { BuyerSignupDto } from './dto/signup.dto';
import { VerifyUserDto } from './dto/verifyUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService
  ) {}
  async signupBuyer(buyerSignupDto: BuyerSignupDto) {
    const user = await this.userService.create({
      fullName: buyerSignupDto.fullName,
      email: buyerSignupDto.email,
      password: buyerSignupDto.password,
      agreeToTerms: true,
      signupMethod: SignupMethod.EMAIL,
      role: UserRole.BUYER,
    });

    // Send verification email
    await this.mailerService.sendVerificationEmail(user.verificationToken, user.email);

    return user;
  }

  async verifyUser(verifyUserDto: VerifyUserDto, role: UserRole) {
    const { email, token } = verifyUserDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ForbiddenException('Email or token is invalid');
    }

    return await this.userService.verifyUserEmail(token, email, role);
  }

  async resendVerificationEmail(resendVerificationEmailDo: ResendVerificationEmailDto) {
    const user = await this.userService.findByEmail(resendVerificationEmailDo.email);

    if (user && !user.isVerified) {
      await this.userService.resendVerificationEmail(user);
    }
  }
}
