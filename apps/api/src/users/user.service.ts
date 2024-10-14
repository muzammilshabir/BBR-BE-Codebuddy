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
import { Model, Types } from 'mongoose';
import { ExceptionCodes } from '@bbr/api-core/modules/types/exceptionCodes.type';
import { CreateDummyUserDto, CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserRole, UserStatus } from './enum/user.enum';
import { User } from './schema/user.schema';
import { UserRepository } from './user.repository';
import { UpdateSellerProfileDto } from '../auth/dto/updateProfile';
import { AddFavouritesDto, ListFavouritesDto, PropertyType } from '../auth/dto/addToFavourite';
import { ResidenceRepository } from '../residences/residences.repository';
import { UnitRepository } from '../unit/unit.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with the given email already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();

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

  async verifyUserEmail(token: string, email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email, verificationToken: token }).exec();

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

  async updatePassword(id: string, password: string) {
    return await this.userRepository.update(id, { password });
  }

  async update(
    id: string,
    updateUserDto: Partial<UpdateUserDto>
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

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return await this.userRepository.update(id, updateUserDto);
  }

  async acceptBbrCommitment(
    id: string,
    commitment: boolean
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userRepository.update(id, { acceptBBRCommitment: commitment });
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
    const transformedDto = {
      ...updateSellerProfileDto,
      associatedBrandId: updateSellerProfileDto.associatedBrandId
        ? updateSellerProfileDto.associatedBrandId.map((brandId) => new Types.ObjectId(brandId))
        : undefined,

      avatarImage: updateSellerProfileDto.avatarImage
        ? new Types.ObjectId(updateSellerProfileDto.avatarImage)
        : undefined,
      companyLogo: updateSellerProfileDto.companyLogo
        ? new Types.ObjectId(updateSellerProfileDto.companyLogo)
        : undefined,
      status: UserStatus.ACTIVE,
    };

    const updatedUser = await this.userRepository.update(id, transformedDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async createDummyDeveloper(userDetails: CreateDummyUserDto): Promise<User> {
    try {
      const verificationToken = this.tokenService.generateVerificationToken();
      userDetails.verificationToken = verificationToken;
      return await this.userRepository.create(userDetails);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async addFavourites(userId: string, addFavouritesDto: AddFavouritesDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { propertyType, favouriteId } = addFavouritesDto;
    const objectId = new Types.ObjectId(favouriteId);

    if (propertyType === PropertyType.UNIT) {
      const unit = await this.unitRepository.findById(favouriteId);
      if (!unit) {
        throw new NotFoundException(`Unit with id ${favouriteId} not found`);
      }

      // Use addToSet to ensure unique entries
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { favouritesUnitIds: objectId },
      });
    } else if (propertyType === PropertyType.RESIDENCE) {
      const residence = await this.residenceRepository.findById(favouriteId);
      if (!residence) {
        throw new NotFoundException(`Residence with id ${favouriteId} not found`);
      }

      // Use addToSet to ensure unique entries
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { favouriteResidenceIds: objectId },
      });
    }

    return await this.userModel.findById(userId);
  }

  async getFavourites(userId: string, listFavouritesDto: ListFavouritesDto) {
    const user = await this.userModel.findById(userId);
    const { propertyType, search } = listFavouritesDto;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const options = PaginationService.prepareOptions(listFavouritesDto);

    const filter: any = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    if (propertyType === PropertyType.UNIT) {
      filter._id = { $in: user.favouritesUnitIds };

      const { data, count } = await this.unitRepository.findAll(filter, options);

      const { pagination } = PaginationService.paginate({ rows: data, count }, listFavouritesDto);

      return { pagination, favourites: data };
    } else if (propertyType === PropertyType.RESIDENCE) {
      filter._id = { $in: user.favouriteResidenceIds };

      const { data, count } = await this.residenceRepository.findAll(filter, options);

      const { pagination } = PaginationService.paginate({ rows: data, count }, listFavouritesDto);

      return { pagination, favourites: data };
    } else {
      throw new BadRequestException('Invalid property type');
    }
  }
}
