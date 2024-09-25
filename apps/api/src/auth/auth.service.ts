import { BadRequestException } from '@bbr/api-core/modules/exceptions';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { CaptchaEnum } from '@bbr/api-core/modules/types/captcha.type';
import { ExceptionCodes } from '@bbr/api-core/modules/types/exceptionCodes.type';
import { JwtResponseType, JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { TokenEnum } from '@bbr/api-core/modules/types/verification-token.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { NotFoundException, UnauthorizedException } from '@nestjs/common/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ServiceConfig } from '../config';
import { SendEmailEvent } from '../mailer/events/send-email.event';
import { RedisService } from '../redis/redis.service';
import { SignupMethod, UserRole } from '../users/enum/user.enum';
import { User } from '../users/schema/user.schema';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/passwordReset.dto';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail';
import { BuyerSignupDto, SellerSignupDto } from './dto/signup.dto';
import {
  AcceptBBRCommitment,
  UpdateBuyerProfileDto,
  UpdateSellerProfileDto,
} from './dto/updateProfile';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { JwtPayloadType } from './type/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ServiceConfig,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService
  ) {}

  static generateVerificationLink(email: string, verifyToken: string) {
    return `${process.env.SERVICE_URL}/api/verify-email?token=${verifyToken}&email=${email}`;
  }

  static generateResetPasswordLink(email: string, verifyToken: string) {
    return `${process.env.SERVICE_URL}/api/reset-password?token=${verifyToken}&email=${email}`;
  }

  async signupBuyer(buyerSignupDto: BuyerSignupDto) {
    const user = await this.userService.create({
      fullName: buyerSignupDto.fullName,
      email: buyerSignupDto.email,
      password: await argon.hash(buyerSignupDto.password),
      agreeToTerms: true,
      signupMethod: SignupMethod.EMAIL,
      role: UserRole.BUYER,
      receiveLuxuryInsights: buyerSignupDto.receiveLuxuryInsights,
    });

    this.sendVerificationEmail(user.email, user.verificationToken);

    return user;
  }

  async verifyUser(verifyUserDto: VerifyUserDto, role: UserRole) {
    const { email, token } = verifyUserDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ForbiddenException('Email or token is invalid');
    }

    await this.userService.verifyUserEmail(token, email);

    if (role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
      return {
        tokens: await this.generateJwtToken(user),
        errorCode: ExceptionCodes.AcceptBBRCommitment,
        message: 'Please accept BBR commitment',
      };
    }

    return await this.generateJwtToken(user);
  }

  async resendVerificationEmail(resendVerificationEmailDo: ResendVerificationEmailDto) {
    const user = await this.userService.assignVerificationToken(resendVerificationEmailDo.email);

    if (user && !user.isVerified) {
      this.sendVerificationEmail(user.email, user.verificationToken);
    }
  }

  async loginWithEmailPassword(loginDto: LoginDto, role: UserRole, ip: string) {
    const user = await this.userService.findByEmail(loginDto.email);

    let failedCount = await this.redisService.get({
      prefix: CaptchaEnum.PREFIX,
      key: ip,
    });

    if (!failedCount) {
      failedCount = '0';
    }

    if (!user) {
      await this.redisService.set({
        prefix: CaptchaEnum.PREFIX,
        key: ip,
        value: String(Number(failedCount) + 1),
      });

      throw new NotFoundException('Invalid credentials');
    }

    if (!user.isVerified) {
      await this.resendVerificationEmail({ email: user.email });
      return {
        errorCode: ExceptionCodes.UnverifiedUser,
        message: 'Please verify your account first',
      };
    }

    const isPasswordMatch = await argon.verify(user.password, loginDto.password);

    if (!isPasswordMatch) {
      await this.redisService.set({
        prefix: CaptchaEnum.PREFIX,
        key: ip,
        value: String(Number(failedCount) + 1),
      });

      throw new ForbiddenException('Invalid credentials');
    }

    await this.redisService.delete({ prefix: CaptchaEnum.PREFIX, key: ip });

    if (role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
      return {
        tokens: await this.generateJwtToken(user),
        errorCode: ExceptionCodes.AcceptBBRCommitment,
        message: 'Please accept BBR commitment',
      };
    }

    return { tokens: await this.generateJwtToken(user) };
  }

  async refreshToken(userFromToken: JwtPayloadType) {
    const user = await this.userService.findById(userFromToken.sub);

    if (!user) throw new ForbiddenException('Invalid token');

    return await this.generateJwtToken(user);
  }

  private async generateJwtToken(user: User): Promise<JwtResponseType> {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, tokenType: JwtTokenType.ACCESS },
        {
          secret: this.configService.jwt.atSecret,
          expiresIn: '1d',
        }
      ),
      this.jwtService.signAsync(
        { ...payload, tokenType: JwtTokenType.REFRESH },
        {
          secret: this.configService.jwt.rtSecret,
          expiresIn: '7d',
        }
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async sendVerificationEmail(email: string, verifyToken: string) {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          email,
          deeplink: AuthService.generateVerificationLink(email, verifyToken),
        },
        template: 'verify-user',
        subject: 'Verify Your Email Address',
        toEmail: email,
      })
    );
  }

  async updateBuyer(loggedInUser: JwtPayloadType, updateBuyerDto: UpdateBuyerProfileDto) {
    if (!loggedInUser || !loggedInUser.sub) throw new UnauthorizedException('Invalid token');

    if (loggedInUser.role !== UserRole.BUYER) throw new UnauthorizedException('Invalid token');

    return await this.userService.update(loggedInUser.sub, updateBuyerDto);
  }

  async signupDeveloper(sellerSignupDto: SellerSignupDto) {
    const user = await this.userService.create({
      fullName: sellerSignupDto.fullName,
      email: sellerSignupDto.corporateEmail,
      corporateEmail: sellerSignupDto.corporateEmail,
      password: await argon.hash(sellerSignupDto.password),
      signupMethod: SignupMethod.EMAIL,
      role: UserRole.SELLER,
      agreeToTerms: true,
      receiveLuxuryInsights: sellerSignupDto.receiveLuxuryInsights,
      acceptBBRCommitment: false,
    });

    this.sendVerificationEmail(user.email, user.verificationToken);

    return user;
  }

  async acceptBbrCommitment(user: JwtPayloadType, acceptBBRCommitment: AcceptBBRCommitment) {
    const { commitement } = acceptBBRCommitment;
    if (!commitement) throw new BadRequestException('Please accept Bbr commitment');

    return await this.userService.acceptBbrCommitment(user.sub, commitement);
  }

  async forgotPassword(forgetPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(forgetPasswordDto.email);

    if (user) {
      const resetToken = this.tokenService.generateVerificationToken();

      await this.redisService.set({
        prefix: TokenEnum.PREFIX,
        key: resetToken,
        value: forgetPasswordDto.email,
        expiry: 900, // 15 minutes
      });

      await this.sendResetPasswordLink(forgetPasswordDto.email, resetToken);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const email = await this.redisService.get({
      prefix: TokenEnum.PREFIX,
      key: resetPasswordDto.token,
    });

    if (!email) {
      throw new NotFoundException('Invalid credentials');
    }

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordMatch = await argon.verify(user.password, resetPasswordDto.password);

    if (isPasswordMatch) {
      throw new BadRequestException(
        'This password has been used before. Please use another password.'
      );
    }

    await this.redisService.delete({ prefix: TokenEnum.PREFIX, key: resetPasswordDto.token });

    await this.userService.updatePassword(user.id, await argon.hash(resetPasswordDto.password));
  }

  async sendResetPasswordLink(email: string, token: string): Promise<void> {
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          email,
          deeplink: AuthService.generateResetPasswordLink(email, token),
        },
        template: 'forgot-password',
        subject: 'Reset Your Password',
        toEmail: email,
      })
    );
  }

  async updateSeller(loggedInUser: JwtPayloadType, updateSellerProfileDto: UpdateSellerProfileDto) {
    if (!loggedInUser || !loggedInUser.sub) throw new UnauthorizedException('Invalid token');

    if (loggedInUser.role !== UserRole.SELLER) throw new UnauthorizedException('Invalid token');

    return await this.userService.updateSeller(loggedInUser.sub, updateSellerProfileDto);
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userDetails: JwtPayloadType
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('Current password and new password cannot be the same');
    }

    const user = await this.userService.findByEmail(userDetails.email);
    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordMatch = await argon.verify(user.password, currentPassword);
    if (!isPasswordMatch) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.userService.updatePassword(user.id, await argon.hash(newPassword));
  }

  async createDummyDeveloper(userDetails: any) {
    const user = await this.userService.createDummyDeveloper(userDetails);

    this.sendVerificationEmail(user.email, user.verificationToken);

    return user;
  }
}
