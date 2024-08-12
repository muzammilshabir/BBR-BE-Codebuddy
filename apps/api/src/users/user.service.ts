import { MailerService } from '@bbr/api-core/modules/mailer/mailer.service';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { JwtResponseType, JwtTokenType } from '@bbr/api-core/modules/types/jwtToken.type';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { ServiceConfig } from '../config';
import { CreateUserDto } from './dto/createUser.dto';
import { UserType } from './enum/user.enum';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
    private readonly configService: ServiceConfig
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with the given email already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Generate a random verification token
    const verifyToken = this.tokenService.generateVerificationToken();

    // Create a new user object with hashed password, default isVerified=false, and verifyToken
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: false,
      verificationToken: verifyToken,
    });

    try {
      // Save the user to the database
      await newUser.save();

      // Send verification email
      await this.mailerService.sendVerificationEmail(newUser.verificationToken, newUser.email);

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyUserEmail(
    token: string,
    email: string,
    userType: UserType
  ): Promise<JwtResponseType> {
    const user = await this.userModel
      .findOne({ email, verificationToken: token, userType: userType })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found or invalid verification token');
    }

    if (user.isVerified) {
      throw new BadRequestException('User already verified');
    }

    if (!user.verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.verificationToken !== token) {
      throw new BadRequestException('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return await this.generateJwtToken(user);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async generateJwtToken(user: User): Promise<JwtResponseType> {
    const payload = { email: user.email, sub: user.id, userType: user.userType };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, tokenType: JwtTokenType.ACCESS },
        {
          secret: this.configService.jwt.atSecret,
          expiresIn: '1h',
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

  async resendVerificationEmail(user: User): Promise<void> {
    const verifyToken = this.tokenService.generateVerificationToken();
    user.verificationToken = verifyToken;
    await user.save();
    await this.mailerService.sendVerificationEmail(verifyToken, user.email);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.tokenService.generateVerificationToken();
    user.verificationToken = resetToken;
    await user.save();

    await this.mailerService.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassword(_id: string, token: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ verificationToken: token }).exec();

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationToken = null;
    await user.save();
  }
}
