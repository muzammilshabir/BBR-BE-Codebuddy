import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { UserModel } from './user.model';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './schemas/user.schema';
import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import { MailerService } from '@bbr/api-core/modules/mailer/mailer.service';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserModel>,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserModel> {
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
      await this.mailerService.sendVerificationEmail(newUser.id, newUser.verificationToken, newUser.email);

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyUserEmail(token: string, _id: string): Promise<string> {
    const user = await this.userModel.findOne({ _id, verificationToken: token }).exec();

    if (!user) {
      throw new NotFoundException('User not found or invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return 'User email verified successfully';
  }

  async findByEmail(email: string): Promise<UserModel> {
    return this.userModel.findOne({ email }).exec();
  }

  async validateUser(email: string, password: string): Promise<UserModel> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async generateJwtToken(user: UserModel): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.signAsync(payload, { expiresIn: '1h' });
  }

  async resendVerificationEmail(user: UserModel): Promise<void> {
    const verifyToken = this.tokenService.generateVerificationToken();
    user.verificationToken = verifyToken;
    await user.save();
    await this.mailerService.sendVerificationEmail(user.id, verifyToken,user.email);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.tokenService.generateVerificationToken();
    user.verificationToken = resetToken;
    await user.save();

    await this.mailerService.sendResetPasswordEmail(user.id, user.email, resetToken);
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
