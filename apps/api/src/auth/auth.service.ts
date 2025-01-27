import { BadRequestException } from '@bbr/api-core/modules/exceptions';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { CaptchaEnum } from '@bbr/api-core/modules/types/captcha.type';
import { ExceptionCodes } from '@bbr/api-core/modules/types/exceptionCodes.type';
import { JwtResponseType, JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import { TokenEnum } from '@bbr/api-core/modules/types/verification-token.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ServiceConfig } from '../config';
import { SendEmailEvent } from '../mailer/events/send-email.event';
import { RedisService } from '../redis/redis.service';
import { SignupMethod, UserRole } from '../users/enum/user.enum';
import { User } from '../users/schema/user.schema';
import { UserService } from '../users/user.service';
import { LoginDto, ThirdPartyLoginDto } from './dto/login.dto';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/passwordReset.dto';
import { ResendVerificationEmailDto } from './dto/resendVerificationEmail';
import {
  AddStaffMemberDto,
  BuyerSignupDto,
  ClaimSellerDto,
  SellerSignupDto,
} from './dto/signup.dto';
import {
  AcceptBBRCommitment,
  UpdateBuyerProfileDto,
  UpdateUserStatusDto,
  UpdateSellerProfileDto,
  UpdateStaffMemberDto,
  UpdateSellerByIdDto,
  ResetPasswordByIdDto,
} from './dto/updateProfile';
import { VerifyUserDto } from './dto/verifyUser.dto';
import { JwtPayloadType } from './type/jwt-payload.type';
import { StripeService } from 'src/stripe/stripe.service';
import { AddSellerDto, CreateDummyUserDto } from '../users/dto/createUser.dto';
import { Types } from 'mongoose';
import { AddFavouritesDto, ListFavouritesDto } from './dto/addToFavourite';
import { ListAdminsDto, ListUserDto } from './dto/listUsers';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import { LoginStatus } from '../loginAttempt/schema/loginAttempt.schema';
import * as CryptoJS from 'crypto-js';
import { LoginAttemptEvent } from './events/login-attempt.event';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ServiceConfig,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly stripeService: StripeService,
    private readonly httpService: HttpService,
    private readonly loginAttemptRepository: LoginAttemptRepository
  ) {}

  private static getBaseUrl(userRole: UserRole): string {
    return userRole === UserRole.ADMIN ? process.env.ADMIN_FRONTEND_URL : process.env.FRONTEND_URL;
  }

  private static getRolePathForVerification(userRole: UserRole, isClaim: boolean): string {
    const path = '/auth/verify-email';
    const params = new URLSearchParams();

    switch (userRole) {
      case UserRole.BUYER:
        return `${path}/buyer?`;
      case UserRole.SELLER:
        if (isClaim) {
          params.set('claim', 'true');
          return `${path}/developer?${params.toString()}&`;
        }
        return `${path}/developer?`;
      case UserRole.ADMIN:
        return `${path}?`;
      default:
        throw new Error('Invalid user role');
    }
  }

  static generateVerificationLink(
    email: string,
    verifyToken: string,
    userRole: UserRole,
    isClaim: boolean
  ): string {
    const baseUrl = this.getBaseUrl(userRole);
    const path = this.getRolePathForVerification(userRole, isClaim);
    return `${baseUrl}${path}token=${verifyToken}&email=${email}`;
  }

  static generateResetPasswordLink(email: string, verifyToken: string, userRole: UserRole): string {
    const baseUrl = this.getBaseUrl(userRole);
    const path = '/auth/reset-password';
    return `${baseUrl}${path}?token=${verifyToken}&email=${email}`;
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

    this.sendVerificationEmail(user.email, user.verificationToken, user.role);

    return user;
  }

  async decrypt(cipherText: string): Promise<string> {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    return new Promise((resolve) => {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      resolve(decryptedText);
    });
  }

  async verifyUser(verifyUserDto: VerifyUserDto, role: UserRole) {
    const { token } = verifyUserDto;
    const email = await this.decrypt(verifyUserDto.email);

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new ForbiddenException('Email or token is invalid');
    }

    await this.userService.verifyUserEmail(token, email);

    const stripeCustomer = await this.stripeService.createCustomer({
      name: user.fullName,
      email: user.email,
      metadata: {
        company_name: user.companyName,
      },
    });
    //Todo: verify strip flow
    if (stripeCustomer.id) {
      await this.userService.updateSellerStripeCustomerId(user.id, stripeCustomer.id);
    }

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
      this.sendVerificationEmail(user.email, user.verificationToken, user.role);
    }
  }

  async loginWithEmailPassword(loginDto: LoginDto, ip: string, role: UserRole) {
    const user = await this.userService.findByEmail(loginDto.email, role);

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

      this.eventEmitter.emit(
        LoginAttemptEvent.event,
        new LoginAttemptEvent({
          status: LoginStatus.FAILED
        })
      );

      throw new NotFoundException('Invalid credentials');
    }

    if (!user.isVerified) {
      await this.resendVerificationEmail({ email: user.email });

      this.eventEmitter.emit(
        LoginAttemptEvent.event,
        new LoginAttemptEvent({
          userId: user.id,
          status: LoginStatus.FAILED
        })
      );

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

      this.eventEmitter.emit(
        LoginAttemptEvent.event,
        new LoginAttemptEvent({
          userId: user.id,
          status: LoginStatus.FAILED
        })
      );

      throw new ForbiddenException('Invalid credentials');
    }

    await this.redisService.delete({ prefix: CaptchaEnum.PREFIX, key: ip });

    if (user.role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
      this.eventEmitter.emit(
        LoginAttemptEvent.event,
        new LoginAttemptEvent({
          userId: user.id,
          status: LoginStatus.SUCCESS
        })
      );

      return {
        tokens: await this.generateJwtToken(user),
        errorCode: ExceptionCodes.AcceptBBRCommitment,
        message: 'Please accept BBR commitment',
      };
    }

    try {
      const loginDetails: any = { ip, loginTime: new Date() };
      if (loginDto?.address) {
        loginDetails.loginAddress = loginDto.address;
      }
      await this.userService.updateUser(user.id, loginDetails);
    } catch (error) {
      console.error('Error updating login details:', error);
    }

    this.eventEmitter.emit(
      LoginAttemptEvent.event,
      new LoginAttemptEvent({
        userId: user.id,
        status: LoginStatus.SUCCESS
      })
    );

    return { tokens: await this.generateJwtToken(user) };
  }

  async handleGoogleAuth(thirdPartyLoginDto: ThirdPartyLoginDto) {
    const googleUserData = await firstValueFrom(
      this.httpService
        .get(`https://oauth2.googleapis.com/tokeninfo?id_token=${thirdPartyLoginDto.token}`)
        .pipe(
          catchError((error: AxiosError) => {
            throw new ForbiddenException(error.message || 'Access Denied');
          })
        )
    );

    const googleUser = googleUserData.data;
    if (!thirdPartyLoginDto?.role) {
      const user = await this.userService.findByEmail(googleUser?.email);
      if (!user) {
        throw new NotFoundException(
          'No user found with this email. Please sign up to create an account.'
        );
      }

      return { tokens: await this.generateJwtToken(user) };
    }

    const user = await this.userService.findByEmail(googleUser?.email);

    if (user) {
      if (user.signupMethod !== SignupMethod.GOOGLE) {
        throw new BadRequestException(
          'User already exists with same email address and different signup method!'
        );
      }
      if (!user.isVerified) {
        await this.resendVerificationEmail({ email: user.email });
        return {
          errorCode: ExceptionCodes.UnverifiedUser,
          message: 'Please verify your account first',
        };
      }
      if (thirdPartyLoginDto?.role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
        return {
          tokens: await this.generateJwtToken(user),
          errorCode: ExceptionCodes.AcceptBBRCommitment,
          message: 'Please accept BBR commitment',
        };
      }

      return { tokens: await this.generateJwtToken(user) };
    }

    if (thirdPartyLoginDto?.role === UserRole.BUYER) {
      const newUser = await this.userService.create({
        fullName: googleUser.given_name + ' ' + googleUser.family_name,
        email: googleUser.email,
        agreeToTerms: true,
        signupMethod: SignupMethod.GOOGLE,
        role: UserRole.BUYER,
        isVerified: true,
        emailVerified: true,
      });

      return { tokens: await this.generateJwtToken(newUser) };
    }

    const newUser = await this.userService.create({
      fullName: googleUser.given_name + ' ' + googleUser.family_name,
      email: googleUser.email,
      agreeToTerms: true,
      corporateEmail: googleUser.email,
      signupMethod: SignupMethod.GOOGLE,
      role: UserRole.SELLER,
      acceptBBRCommitment: false,
      isVerified: true,
      emailVerified: true,
    });

    return { tokens: await this.generateJwtToken(newUser) };
  }

  async handleFbAuth(thirdPartyLoginDto: ThirdPartyLoginDto) {
    const fbUserData = await firstValueFrom(
      this.httpService
        .get(
          `https://graph.facebook.com/v16.0/me?access_token=${thirdPartyLoginDto.token}&fields=first_name,last_name,email`
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new ForbiddenException(error.message || 'Access Denied');
          })
        )
    );

    if (fbUserData.status >= 400) throw new ForbiddenException('Access Denied');

    const fbUser = fbUserData.data;
    if (!thirdPartyLoginDto?.role) {
      const user = await this.userService.findByEmail(fbUser?.email);
      if (!user) {
        throw new NotFoundException(
          'No user found with this email. Please sign up to create an account.'
        );
      }

      return { tokens: await this.generateJwtToken(user) };
    }

    const user = await this.userService.findByEmail(fbUser?.email);

    if (user) {
      if (user.signupMethod !== SignupMethod.FACEBOOK) {
        throw new BadRequestException(
          'User already exists with same email address and different signup method!'
        );
      }
      if (!user.isVerified) {
        await this.resendVerificationEmail({ email: user.email });
        return {
          errorCode: ExceptionCodes.UnverifiedUser,
          message: 'Please verify your account first',
        };
      }
      if (thirdPartyLoginDto.role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
        return {
          tokens: await this.generateJwtToken(user),
          errorCode: ExceptionCodes.AcceptBBRCommitment,
          message: 'Please accept BBR commitment',
        };
      }
    }

    if (thirdPartyLoginDto.role === UserRole.BUYER) {
      const newUser = await this.userService.create({
        fullName: fbUser.first_name + fbUser.last_name,
        email: fbUser.email,
        agreeToTerms: true,
        signupMethod: SignupMethod.FACEBOOK,
        role: UserRole.BUYER,
        isVerified: true,
        emailVerified: true,
      });

      return { tokens: await this.generateJwtToken(newUser) };
    }

    const newUser = await this.userService.create({
      fullName: fbUser.first_name + fbUser.last_name,
      email: fbUser.email,
      agreeToTerms: true,
      corporateEmail: fbUser.email,
      signupMethod: SignupMethod.FACEBOOK,
      role: UserRole.SELLER,
      acceptBBRCommitment: false,
      isVerified: true,
      emailVerified: true,
    });

    return { tokens: await this.generateJwtToken(newUser) };
  }

  async handleLinkedInAuth(thirdPartyLoginDto: ThirdPartyLoginDto) {
    try {
      const linkedInUser = await this.fetchLinkedInUserData(thirdPartyLoginDto.token);

      if (!thirdPartyLoginDto?.role) {
        const user = await this.userService.findByEmail(linkedInUser?.email);
        if (!user) {
          throw new NotFoundException(
            'No user found with this email. Please sign up to create an account.'
          );
        }

        return { tokens: await this.generateJwtToken(user) };
      }

      const user = await this.userService.findByEmail(linkedInUser?.email);

      if (user) {
        if (user.signupMethod !== SignupMethod.LINKEDIN) {
          throw new BadRequestException(
            'User already exists with same email address and different signup method!'
          );
        }
        if (!user.isVerified) {
          await this.resendVerificationEmail({ email: user.email });
          return {
            errorCode: ExceptionCodes.UnverifiedUser,
            message: 'Please verify your account first',
          };
        }
        if (thirdPartyLoginDto.role === UserRole.SELLER && user.acceptBBRCommitment !== true) {
          return {
            tokens: await this.generateJwtToken(user),
            errorCode: ExceptionCodes.AcceptBBRCommitment,
            message: 'Please accept BBR commitment',
          };
        }

        return { tokens: await this.generateJwtToken(user) };
      }

      return await this.registerNewUser(linkedInUser, thirdPartyLoginDto.role);
    } catch (error) {
      throw new ForbiddenException(error.message || 'Access Denied');
    }
  }

  private async registerNewUser(linkedInUser, role: UserRole) {
    if (role === UserRole.BUYER) {
      const newUser = await this.userService.create({
        fullName: linkedInUser.given_name + linkedInUser.family_name,
        email: linkedInUser.email,
        agreeToTerms: true,
        signupMethod: SignupMethod.LINKEDIN,
        role: UserRole.BUYER,
        isVerified: true,
        emailVerified: true,
      });

      return { tokens: await this.generateJwtToken(newUser) };
    }

    const newUser = await this.userService.create({
      fullName: linkedInUser.given_name + linkedInUser.family_name,
      email: linkedInUser.email,
      agreeToTerms: true,
      corporateEmail: linkedInUser.email,
      signupMethod: SignupMethod.LINKEDIN,
      role: UserRole.SELLER,
      acceptBBRCommitment: false,
      isVerified: true,
      emailVerified: true,
    });

    return { tokens: await this.generateJwtToken(newUser) };
  }

  private async fetchLinkedInUserData(accessToken: string) {
    const { data, status } = await firstValueFrom(
      this.httpService
        .get(`https://api.linkedin.com/v2/userinfo`, {
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ForbiddenException(error.message || 'Access Denied');
          })
        )
    );

    if (status >= 400) throw new ForbiddenException('Access Denied');

    return data;
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

  async encrypt(text: string): Promise<string> {
    const secretKey = process.env.ENCRYPTION_SECRET_KEY;
    return new Promise((resolve) => {
      const cipherText = CryptoJS.AES.encrypt(text, secretKey).toString();
      resolve(cipherText);
    });
  }

  async sendVerificationEmail(
    email: string,
    verifyToken: string,
    userRole: UserRole,
    isClaim = false
  ) {
    const encryptedEmail = await this.encrypt(email);
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          email,
          deeplink: AuthService.generateVerificationLink(
            encryptedEmail,
            verifyToken,
            userRole,
            isClaim
          ),
        },
        template: 'verify-user',
        subject: 'Verify Your Email Address',
        toEmail: email,
      })
    );
  }

  async updateBuyer(userId: string, updateBuyerDto: UpdateBuyerProfileDto) {
    const user = await this.userService.getBuyerById(userId);

    if (updateBuyerDto.email) {
      const existingUser = await this.userService.findByEmail(updateBuyerDto.email);
      if (existingUser && existingUser._id.toString() !== user.id) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    const transformedDto: any = {
      ...updateBuyerDto,
    };

    if (updateBuyerDto.avatarImage) {
      transformedDto.avatarImage = updateBuyerDto.avatarImage
        ? new Types.ObjectId(updateBuyerDto.avatarImage)
        : undefined;
    }

    // Only include preferences if they are provided in the update DTO
    if (updateBuyerDto.preferences) {
      transformedDto.preferences = { ...updateBuyerDto.preferences };

      // Only transform and include each preference array if it exists
      if (updateBuyerDto.preferences.cityIds?.length) {
        transformedDto.preferences.cityIds = updateBuyerDto.preferences.cityIds.map(
          (id) => new Types.ObjectId(id)
        );
      }

      if (updateBuyerDto.preferences.residenceTypeIds?.length) {
        transformedDto.preferences.residenceTypeIds =
          updateBuyerDto.preferences.residenceTypeIds.map((id) => new Types.ObjectId(id));
      }

      if (updateBuyerDto.preferences.countryIds?.length) {
        transformedDto.preferences.countryIds = updateBuyerDto.preferences.countryIds.map(
          (id) => new Types.ObjectId(id)
        );
      }

      if (updateBuyerDto.preferences.lifeStyleIds?.length) {
        transformedDto.preferences.lifeStyleIds = updateBuyerDto.preferences.lifeStyleIds.map(
          (id) => new Types.ObjectId(id)
        );
      }
    }

    return await this.userService.update(user.id, transformedDto);
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

    this.sendVerificationEmail(user.email, user.verificationToken, user.role);

    return user;
  }

  async acceptBbrCommitment(user: JwtPayloadType, acceptBBRCommitment: AcceptBBRCommitment) {
    const { commitement } = acceptBBRCommitment;
    if (!commitement) throw new BadRequestException('Please accept Bbr commitment');

    return await this.userService.acceptBbrCommitment(user.sub, commitement);
  }

  async forgotPassword(forgetPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findByEmail(forgetPasswordDto.email);
    if (!user) {
      throw new BadRequestException('No account is associated with the provided email address');
    }

    if (user) {
      const resetToken = this.tokenService.generateVerificationToken();

      await this.redisService.set({
        prefix: TokenEnum.PREFIX,
        key: resetToken,
        value: forgetPasswordDto.email,
        expiry: 900, // 15 minutes
      });

      await this.sendResetPasswordLink(forgetPasswordDto.email, resetToken, user.role);
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
    const decryptedEmail = await this.decrypt(resetPasswordDto.email);

    const user = await this.userService.findByEmail(decryptedEmail);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    if (user?.password) {
      const isPasswordMatch = await argon.verify(user.password, resetPasswordDto.password);

      if (isPasswordMatch) {
        throw new BadRequestException(
          'This password has been used before. Please use another password.'
        );
      }
    }

    await this.redisService.delete({ prefix: TokenEnum.PREFIX, key: resetPasswordDto.token });

    await this.userService.updatePassword(user.id, await argon.hash(resetPasswordDto.password));
  }

  async sendResetPasswordLink(email: string, token: string, userRole: UserRole): Promise<void> {
    const encryptedEmail = await this.encrypt(email);
    this.eventEmitter.emit(
      SendEmailEvent.event,
      new SendEmailEvent({
        context: {
          email,
          deeplink: AuthService.generateResetPasswordLink(encryptedEmail, token, userRole),
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

  async createDummyDeveloper(userDetails: CreateDummyUserDto) {
    const user = await this.userService.createDummyDeveloper(userDetails);

    this.sendVerificationEmail(user.email, user.verificationToken, user.role);

    return user;
  }

  async addFavourites(userId: string, addFavouritesDto: AddFavouritesDto) {
    return await this.userService.addFavourites(userId, addFavouritesDto);
  }

  async getFavourites(userId: string, query: ListFavouritesDto) {
    if (!userId) throw new UnauthorizedException('Invalid user');

    return await this.userService.getFavourites(userId, query);
  }

  async getSellerById(id: string): Promise<User> {
    return await this.userService.getSellerById(id);
  }

  async listSellers(listUserDto: ListUserDto) {
    return await this.userService.listSellers(listUserDto);
  }

  async updateSellerStatus(updateDeveloperStatusDto: UpdateUserStatusDto): Promise<User> {
    return await this.userService.updateSellerStatus(updateDeveloperStatusDto);
  }

  async addSeller(addSellerDto: AddSellerDto) {
    const seller = await this.userService.addSeller(addSellerDto);
    await this.sendVerificationEmail(seller.email, seller.verificationToken, seller.role);
    return seller;
  }

  async addStaffMember(addStaffMemberDto: AddStaffMemberDto, userId: string) {
    const user = await this.userService.addStaffMember(
      {
        fullName: addStaffMemberDto.fullName,
        email: addStaffMemberDto.email,
        roleId: new Types.ObjectId(addStaffMemberDto.roleId),
        phone: addStaffMemberDto.phone,
        avatarImage: addStaffMemberDto.avatarImage
          ? new Types.ObjectId(addStaffMemberDto.avatarImage)
          : undefined,
      },
      userId
    );

    this.sendVerificationEmail(user.email, user.verificationToken, user.role);

    return user;
  }

  async updateStaffMember(updateStaffMemberDto: UpdateStaffMemberDto, userId: string) {
    const { staffMemberId, ...updateData } = updateStaffMemberDto;

    const updatedUser = await this.userService.updateStaffMember(
      staffMemberId.toString(),
      updateData,
      userId
    );

    return updatedUser;
  }

  async updateStaffMemberStatus(updateStaffMemberStatusDto: UpdateUserStatusDto): Promise<User> {
    return await this.userService.updateStaffMemberStatus(updateStaffMemberStatusDto);
  }

  async getStaffMemberById(id: string): Promise<User> {
    return await this.userService.getStaffMemberById(id);
  }

  async listAdmins(listUserDto: ListAdminsDto) {
    return await this.userService.listAdmins(listUserDto);
  }

  async resetStaffMemberPassword(resetPasswordByIdDto: ResetPasswordByIdDto, userId: string) {
    return await this.userService.resetStaffMemberPassword(resetPasswordByIdDto, userId);
  }

  async me(userFromToken: JwtPayloadType) {
    return await this.userService.me(userFromToken);
  }

  async getBuyerById(id: string): Promise<User> {
    return await this.userService.getBuyerById(id);
  }

  async updateSellerById(sellerId: string, updateSellerByIdDto: UpdateSellerByIdDto) {
    return await this.userService.updateSellerById(sellerId, updateSellerByIdDto);
  }

  async getUsersLoggedInLast24Hours() {
    return await this.userService.findUsersLoggedInLast24HoursWithAdminCount();
  }

  async handleClaimSeller(claimSellerDto: ClaimSellerDto) {
    const user = await this.userService.handleClaimSeller(claimSellerDto);
    if (user) {
      try {
        await this.sendVerificationEmail(user.email, user.verificationToken, UserRole.SELLER, true);
        return user;
      } catch (error) {
        throw new BadRequestException('Failed to send verification email');
      }
    }
  }

  async removeFavourites(userId: string, addFavouritesDto: AddFavouritesDto) {
    return await this.userService.removeFavourites(userId, addFavouritesDto);
  }
}
