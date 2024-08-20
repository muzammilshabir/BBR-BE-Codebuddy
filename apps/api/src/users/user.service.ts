import { TokenService } from '@bbr/api-core/modules/token-generation/token.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { MailerService } from 'src/mailer/mailer.service';
import { ExceptionCodes } from '../../../../packages/api-core/modules/types/exceptionCodes.type';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserRole } from './enum/user.enum';
import { User } from './schema/user.schema';
import { UserRepository } from './user.repository';
import { UpdateSellerProfileDto } from '../auth/dto/updateProfile';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly mailerService: MailerService,
    private readonly userRepository: UserRepository
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with the given email already exists
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email, role: createUserDto.role })
      .exec();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Generate a random verification token
    const verifyToken = this.tokenService.generateVerificationToken();

    // Create a new user object with hashed password, default isVerified=false, and verifyToken
    const newUser = new this.userModel({
      ...createUserDto,
      isVerified: false,
      verificationToken: verifyToken,
    });

    try {
      // Save the user to the database
      await newUser.save();

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyUserEmail(token: string, email: string, role: UserRole): Promise<boolean> {
    const user = await this.userModel.findOne({ email, verificationToken: token, role }).exec();

    if (!user) {
      throw new NotFoundException('Invalid email or verification token');
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

    return true;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findByEmailAndRole(email: string, role: UserRole): Promise<User> {
    return this.userModel.findOne({ email, role }).exec();
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async resendVerificationEmail(user: User): Promise<void> {
    const verifyToken = this.tokenService.generateVerificationToken();
    user.verificationToken = verifyToken;
    await user.save();
  }

  async assignVerificationToken(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();

    if (user && !user.isVerified) {
      const verifyToken = this.tokenService.generateVerificationToken();
      user.verificationToken = verifyToken;
      await user.save();
    }

    return user;
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified) {
      return {
        errorCode: ExceptionCodes.UnverifiedUser,
        message: 'Please verify your account first',
      };
    }

    await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  async acceptBbrCommitment(
    id: string,
    commitement: boolean
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userRepository.update(id, { acceptBBRCommitment: commitement });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateSeller(
    id: string,
    updateSellerProfileDto: UpdateSellerProfileDto
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified) {
      return {
        errorCode: ExceptionCodes.UnverifiedUser,
        message: 'Please verify your account first',
      };
    }

    const updatedUser = await this.userRepository.update(id, updateSellerProfileDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }
}
