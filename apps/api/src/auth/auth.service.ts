import { JwtResponseType, JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { NotFoundException, UnauthorizedException } from '@nestjs/common/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ExceptionCodes } from '../../../../packages/api-core/modules/types/exceptionCodes.type';
import { ServiceConfig } from '../config';
import { SendEmailEvent } from '../mailer/events/send-email.event';
import { SignupMethod, UserRole } from '../users/enum/user.enum';
import { User } from '../users/schema/user.schema';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail';
import { BuyerSignupDto } from './dto/signup.dto';
import { UpdateBuyerProfileDto } from './dto/updateProfile';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { JwtPayloadType } from './type/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ServiceConfig,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  static generateVerificationLink(email: string, verifyToken: string) {
    return `${process.env.SERVICE_URL}/api/verify-email?token=${verifyToken}&email=${email}`;
  }

  async signupBuyer(buyerSignupDto: BuyerSignupDto) {
    const user = await this.userService.create({
      fullName: buyerSignupDto.fullName,
      email: buyerSignupDto.email,
      password: await argon.hash(buyerSignupDto.password),
      agreeToTerms: true,
      signupMethod: SignupMethod.EMAIL,
      role: UserRole.BUYER,
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

    await this.userService.verifyUserEmail(token, email, role);

    return await this.generateJwtToken(user);
  }

  async resendVerificationEmail(resendVerificationEmailDo: ResendVerificationEmailDto) {
    const user = await this.userService.assignVerificationToken(resendVerificationEmailDo.email);

    if (user && !user.isVerified) {
      this.sendVerificationEmail(user.email, user.verificationToken);
    }
  }

  async loginWithEmailPassword(loginDto: LoginDto, role: UserRole) {
    const user = await this.userService.findByEmailAndRole(loginDto.email, role);

    if (!user) throw new NotFoundException('Invalid credentials');

    if (!user.isVerified) {
      await this.resendVerificationEmail({ email: user.email });
      return {
        errorCode: ExceptionCodes.UnverifiedUser,
        message: 'Please verify your account first',
      };
    }

    const isPasswordMatch = await argon.verify(user.password, loginDto.password);

    if (!isPasswordMatch) throw new ForbiddenException('Invalid credentials');

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
}
