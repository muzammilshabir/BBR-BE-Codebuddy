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
import { AddSellerDto, CreateDummyUserDto, CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { SignupMethod, UserRole, UserStatus } from './enum/user.enum';
import { User } from './schema/user.schema';
import { UserRepository } from './user.repository';
import {
  ResetPasswordByIdDto,
  UpdateSellerByIdDto,
  UpdateSellerProfileDto,
  UpdateUserStatusDto,
} from '../auth/dto/updateProfile';
import {
  AddFavouritesDto,
  ListFavouritesDto,
  PropertyType,
  RemoveFavouritesDto,
} from '../auth/dto/addToFavourite';
import { ResidenceRepository } from '../residences/residences.repository';
import { UnitRepository } from '../unit/unit.repository';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { ListAdminsDto, ListUserDto } from '../auth/dto/listUsers';
import { AddStaffMemberDto, ClaimSellerDto } from '../auth/dto/signup.dto';
import { RoleRepository } from '../role/role.repository';
import * as argon from 'argon2';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { LoginAttempt } from '../loginAttempt/schema/loginAttempt.schema';
import { LoginAttemptRepository } from '../loginAttempt/loginAttempt.repository';
import { ClaimRequestRepository } from '../claimRequest/claimRequest.repository';
import { ClaimRequestStatus } from '../claimRequest/enum/claimReques-enum';
import { DeveloperProfileActivityLogRepository } from 'src/developer-profile-activity-log/developer-profile-activity-log.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(User.name) private readonly loginAttemptModel: Model<LoginAttempt>,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly residenceRepository: ResidenceRepository,
    private readonly unitRepository: UnitRepository,
    private readonly roleRepository: RoleRepository,
    private readonly loginAttemptRepository: LoginAttemptRepository,
    private readonly claimRequestRepository: ClaimRequestRepository,
    private readonly developerProfileActivityLogRepository: DeveloperProfileActivityLogRepository
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
      isVerified: createUserDto.isVerified ?? false,
      verificationToken: verifyToken,
      loginTime: new Date(),
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
  async findByEmail(email: string, role?: UserRole): Promise<User> {
    const filter: { email: string; role?: UserRole | { $in: UserRole[] } } = { email };

    if (!role) {
      return this.userModel.findOne(filter).exec();
    }

    filter.role =
      role === UserRole.ADMIN ? UserRole.ADMIN : { $in: [UserRole.BUYER, UserRole.SELLER] };

    return this.userModel.findOne(filter).exec();
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
    await this.developerProfileActivityLogRepository.create({
      developerId: new Types.ObjectId(id),
      activityType: 'Password updated',
      userId: new Types.ObjectId(id),
      createdAt: new Date(),
    });

    return await this.userRepository.update(id, {
      password,
      isVerified: true,
      verificationToken: true,
      emailVerified: true,
    });
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

    if (updateSellerProfileDto.corporateEmail) {
      const existingUser = await this.findByEmail(updateSellerProfileDto.corporateEmail);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

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

      const { data, count } = await this.unitRepository.findAll(filter, options, [
        { path: 'residenceId' },
        { path: 'visuals.mainPhotos', model: 'Upload' },
        { path: 'visuals.mainGalleryPhotos', model: 'Upload' },
        { path: 'visuals.secondGalleryPhotos', model: 'Upload' },
        { path: 'visuals.videoTour', model: 'Upload' },
        { path: 'rooms.roomTypeId', model: 'RoomType', select: 'type' },
        {
          path: 'unitKeyFeatures.residenceServices.serviceTypeId',
          model: 'ResidenceService',
          select: 'type',
        },
        { path: 'createdById', model: 'User', select: 'fullName email role' },
        { path: 'updatedById', model: 'User', select: 'fullName email role' },
      ]);

      const { pagination } = PaginationService.paginate({ rows: data, count }, listFavouritesDto);

      return { pagination, favourites: data };
    } else if (propertyType === PropertyType.RESIDENCE) {
      filter._id = { $in: user.favouriteResidenceIds };

      const { data, count } = await this.residenceRepository.findAll(filter, options, [
        {
          path: 'residenceTypeIds',
          select: 'type',
          model: 'ResidenceType',
        },
        { path: 'cityId', select: 'name countryId upload' },
        { path: 'countryId', select: 'name geographicalAreasId upload' },
        { path: 'associatedBrandId', select: 'name' },
        {
          path: 'visuals.mainPhotos',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'visuals.mainGalleryPhotos',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'visuals.secondGalleryPhotos',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'visuals.videoTour',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        { path: 'nearbyAmenities.amenitiesList', select: 'name', model: 'Amenity' },
        {
          path: 'nearbyAmenities.highlightedAmenities.amenityId',
          select: 'name',
          model: 'Amenity',
        },
        {
          path: 'nearbyAmenities.highlightedAmenities.imageId',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        { path: 'createdById', select: 'fullName email role', model: 'User' },
        { path: 'developerId', select: 'fullName email role', model: 'User' },
        { path: 'highestRankingCategoryId', model: 'RankingCategory', select: 'title' },
      ]);

      const { pagination } = PaginationService.paginate({ rows: data, count }, listFavouritesDto);

      return { pagination, favourites: data };
    } else {
      throw new BadRequestException('Invalid property type');
    }
  }

  async getSellerById(id: string): Promise<User> {
    return await this.userRepository.getSellerById(id);
  }

  async listSellers(listUserDto: ListUserDto) {
    const { search } = listUserDto;

    const filter: any = { role: UserRole.SELLER };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'contactPersonInfo.phone.number': { $regex: search, $options: 'i' } },
      ];
    }

    if (listUserDto.status) {
      filter.status = listUserDto.status;
    }

    const options = PaginationService.prepareOptions(listUserDto);

    const { data, count } = await this.userRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUserDto);

    return { pagination, sellers: data };
  }

  async updateSellerStatus(updateDeveloperStatusDto: UpdateUserStatusDto) {
    const { id, status } = updateDeveloperStatusDto;

    const seller = await this.userRepository.findById(id);
    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    seller.status = status;
    await seller.save();

    return seller;
  }

  async addSeller(addSellerDto: AddSellerDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.find({ email: addSellerDto.corporateEmail });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const verifyToken = this.tokenService.generateVerificationToken();

      const payload = {
        ...addSellerDto,
        signupMethod: SignupMethod.EMAIL,
        email: addSellerDto.corporateEmail,
        role: UserRole.SELLER,
        verificationToken: verifyToken,
      };

      return await this.userRepository.create(payload);
    } catch (error) {
      throw error;
    }
  }

  async addStaffMember(addStaffMemberDto: AddStaffMemberDto, userId: string): Promise<User> {
    try {
      const existingUser = await this.userRepository.find({ email: addStaffMemberDto.email });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const existingRole = await this.roleRepository.findById(addStaffMemberDto.roleId.toString());

      if (!existingRole) {
        throw new BadRequestException(
          'The specified role does not exist. Please verify the role and try again.'
        );
      }

      const verificationToken = this.tokenService.generateVerificationToken();
      const payload = {
        ...addStaffMemberDto,
        verificationToken: verificationToken,
        signupMethod: SignupMethod.EMAIL,
        role: UserRole.ADMIN,
        createdById: new Types.ObjectId(userId),
      };
      return await this.userRepository.create(payload);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateStaffMember(
    staffMemberId: string,
    updateData: Partial<AddStaffMemberDto>,
    userId: string
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findById(staffMemberId);
      if (!existingUser) {
        throw new NotFoundException('Staff member not found');
      }

      const existingRole = await this.roleRepository.findById(updateData.roleId.toString());

      if (!existingRole) {
        throw new BadRequestException(
          'The specified role does not exist. Please verify the role and try again.'
        );
      }

      if (updateData.email) {
        const userWithSameEmail = await this.userRepository.find({ email: updateData.email });
        if (userWithSameEmail && userWithSameEmail._id.toString() !== staffMemberId) {
          throw new BadRequestException(
            'The provided email is already in use by another user. Please choose a different email.'
          );
        }
      }

      const updatedUser = await this.userRepository.update(staffMemberId, {
        ...updateData,
        updatedById: new Types.ObjectId(userId),
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateStaffMemberStatus(updateStaffMemberStatusDto: UpdateUserStatusDto) {
    const { id, status } = updateStaffMemberStatusDto;

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('staffMember not found');
    }

    user.status = status;
    await user.save();

    return user;
  }

  async getStaffMemberById(id: string): Promise<User> {
    return await this.userRepository.getStaffMemberById(id);
  }

  async listAdmins(listUserDto: ListAdminsDto) {
    const { search } = listUserDto;

    const filter: any = { role: UserRole.ADMIN };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (listUserDto.status) {
      filter.status = listUserDto.status;
    }

    if (listUserDto.roleId) {
      filter.roleId = listUserDto.roleId;
    }

    const options = PaginationService.prepareOptions(listUserDto);

    const { data, count } = await this.userRepository.findAll(filter, options, [
      {
        path: 'roleId',
        model: 'Role',
        populate: {
          path: 'modulePermissions.moduleId',
          model: 'ModulePolicy',
        },
      },
      { path: 'avatarImage', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listUserDto);

    return { pagination, admins: data };
  }

  async resetStaffMemberPassword(
    resetPasswordByIdDto: ResetPasswordByIdDto,
    loginUserId: string
  ): Promise<User> {
    const { userId, password } = resetPasswordByIdDto;
    const staffMember = await this.userRepository.findById(userId.toString());
    if (!staffMember) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!staffMember.isVerified) {
      throw new BadRequestException('User email is not verified');
    }

    const hashedPassword = await argon.hash(password);
    // Update user password
    const updatedUser = await this.userRepository.update(userId.toString(), {
      password: hashedPassword,
      updatedById: new Types.ObjectId(loginUserId),
    });

    return updatedUser;
  }

  async me(userFromToken: JwtPayloadType) {
    return await this.userRepository.me(userFromToken);
  }
  async updateSellerStripeCustomerId(
    id: string,
    stripeCustomerId: string
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.update(id, { stripeCustomerId });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async getBuyerById(id: string): Promise<User> {
    return await this.userRepository.getBuyerById(id);
  }

  async updateSellerById(
    sellerId: string,
    updateSellerByIdDto: UpdateSellerByIdDto
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userModel.findById(sellerId).exec();

    if (!user) {
      throw new NotFoundException('Seller not found');
    }

    const transformedDto = {
      ...updateSellerByIdDto,
      associatedBrandId: updateSellerByIdDto.associatedBrandId
        ? updateSellerByIdDto.associatedBrandId.map((brandId) => new Types.ObjectId(brandId))
        : undefined,

      avatarImage: updateSellerByIdDto.avatarImage
        ? new Types.ObjectId(updateSellerByIdDto.avatarImage)
        : undefined,
      companyLogo: updateSellerByIdDto.companyLogo
        ? new Types.ObjectId(updateSellerByIdDto.companyLogo)
        : undefined,
    };

    if (updateSellerByIdDto.corporateEmail) {
      const existingUser = await this.findByEmail(updateSellerByIdDto.corporateEmail);
      if (existingUser && existingUser._id.toString() !== sellerId) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    const updatedUser = await this.userRepository.update(sellerId, transformedDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${sellerId} not found`);
    }

    await this.developerProfileActivityLogRepository.create({
      developerId: new Types.ObjectId(user.id),
      activityType: 'Profile details updated',
      userId: new Types.ObjectId(user.id),
      createdAt: new Date(),
    });

    return updatedUser;
  }

  async updateUser(
    id: string,
    updateUserDto: any
  ): Promise<User | { errorCode: ExceptionCodes; message: string }> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.update(id, updateUserDto);
  }

  async findUsersLoggedInLast24HoursWithAdminCount() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago timestamp

    // Find all users logged in within the last 24 hours
    const admins = await this.userRepository.findAll({
      loginTime: { $gte: twentyFourHoursAgo },
      role: UserRole.ADMIN,
    });

    const adminsWithLoginAttempts = await Promise.all(
      admins.data.map(async (admin) => {
        const latestLoginAttempt = await this.loginAttemptRepository.getLatestLoginAttempt(
          admin.id
        );
        // Combine admin details with the latest login attempt
        return {
          ...admin.toJSON(),
          loginAttempt: latestLoginAttempt || null, // Handle case if no attempts found
        };
      })
    );

    // Filter admins with successful login attempts
    const onlineAdminsCount = adminsWithLoginAttempts.filter(
      (admin) => admin.loginAttempt && admin.loginAttempt.status === 'success'
    ).length;

    return {
      admins: adminsWithLoginAttempts,
      onlineAdminsCount, // Include count of online admins
    };
  }

  async handleClaimSeller(dto: ClaimSellerDto) {
    const {
      residenceId,
      corporateEmail,
      fullName,
      companyName,
      password,
      receiveLuxuryInsights,
      acceptBBRCommitment,
    } = dto;

    // Verify residence existence
    const residence = await this.residenceRepository.findById(residenceId);
    if (!residence) {
      throw new NotFoundException('Residence does not exist');
    }

    // Check if the residence is already claimed
    const claimed = await this.claimRequestRepository.find({
      residenceId,
      status: ClaimRequestStatus.Approved,
    });
    if (claimed) {
      throw new BadRequestException('Residence already claimed');
    }

    // Check if the user already exists
    const user = await this.userRepository.find({ corporateEmail });
    if (!user) {
      throw new NotFoundException('No user found with the provided email');
    }

    // Update user if not verified, else return message
    if (!user?.isVerified) {
      user.fullName = fullName;
      user.companyName = companyName;
      (user.password = await argon.hash(password)),
        (user.receiveLuxuryInsights = receiveLuxuryInsights ?? user.receiveLuxuryInsights);
      user.acceptBBRCommitment = acceptBBRCommitment ?? user.acceptBBRCommitment;
      await user.save();

      return await this.userRepository.find({ corporateEmail });
    }

    if (user?.isVerified) {
      throw new BadRequestException(
        'User is already registered and verified. Please log in or reset your password if needed.'
      );
    }
  }

  async removeFavourites(userId: string, removeFavouritesDto: RemoveFavouritesDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { propertyType, favouriteId } = removeFavouritesDto;

    if (propertyType === PropertyType.RESIDENCE) {
      // Check if the residence exists in favorites
      if (!user.favouriteResidenceIds?.some((id) => id.toString() === favouriteId)) {
        throw new BadRequestException('Residence is not in favorites');
      }
      user.favouriteResidenceIds = user.favouriteResidenceIds.filter(
        (id) => id.toString() !== favouriteId
      );
    } else if (propertyType === PropertyType.UNIT) {
      // Check if the unit exists in favorites
      if (!user.favouritesUnitIds?.some((id) => id.toString() === favouriteId)) {
        throw new BadRequestException('Unit is not in favorites');
      }
      user.favouritesUnitIds = user.favouritesUnitIds.filter((id) => id.toString() !== favouriteId);
    }

    // Save and return updated user
    return this.userModel.findByIdAndUpdate(userId, user, { new: true });
  }
}
