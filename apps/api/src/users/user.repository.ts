import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException, UnauthorizedException } from '@bbr/api-core/modules/exceptions';
import { UserRole } from './enum/user.enum';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }
  async getSellerById(id: string): Promise<any> {
    const developer: any = await this.userModel
      .findOne({ _id: id, role: UserRole.SELLER })
      .populate([
        {
          path: 'avatarImage',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'companyLogo',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'preferences.residenceTypeIds',
          select: 'type upload',
          model: 'ResidenceType',
        },
        {
          path: 'preferences.cityIds',
          select: 'name countryId upload',
          model: 'City',
        },
        {
          path: 'preferences.countryIds',
          select: 'name geographicalAreasId upload',
          model: 'Country',
        },
        {
          path: 'preferences.lifeStyleIds',
          select: 'name upload ',
          model: 'LifeStyle',
        },
        {
          path: 'associatedBrandId',
          select: 'name brandCategoryId upload ',
          model: 'Brand',
          populate: {
            path: 'upload.ImageId', // Populate the ImageId inside the 'upload' field
            select: 'originalFileKey fileKey url mimeType',
            model: 'Upload',
          },
        },
      ]);

    if (!developer) {
      throw new NotFoundException(`developer with ID ${id}`);
    }

    return developer;
  }

  async getStaffMemberById(id: string): Promise<any> {
    const developer: any = await this.userModel
      .findOne({ _id: id, role: UserRole.ADMIN })
      .populate([
        {
          path: 'avatarImage',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'roleId',
          model: 'Role',
          populate: {
            path: 'modulePermissions.moduleId',
            model: 'ModulePolicy',
          },
        },
      ]);

    if (!developer) {
      throw new NotFoundException(`developer with ID ${id}`);
    }

    return developer;
  }

  async me(userFromToken: JwtPayloadType) {
    const user = await this.userModel.findById(userFromToken.sub).populate([
      {
        path: 'avatarImage',
        select: 'originalFileKey fileKey url mimeType',
        model: 'Upload',
      },
    ]);
    if (!user) throw new UnauthorizedException('Invalid token');

    delete user.password;
    return user;
  }

  async getBuyerById(id: string): Promise<any> {
    const developer: any = await this.userModel
      .findOne({ _id: id, role: UserRole.BUYER })
      .populate([
        {
          path: 'avatarImage',
          select: 'originalFileKey fileKey url mimeType',
          model: 'Upload',
        },
        {
          path: 'preferences.residenceTypeIds',
          select: 'type upload',
          model: 'ResidenceType',
        },
        {
          path: 'preferences.cityIds',
          select: 'name countryId upload',
          model: 'City',
        },
        {
          path: 'preferences.countryIds',
          select: 'name geographicalAreasId upload',
          model: 'Country',
        },
        {
          path: 'preferences.lifeStyleIds',
          select: 'name upload ',
          model: 'LifeStyle',
        },
      ]);

    if (!developer) {
      throw new NotFoundException(`buyer with ID ${id}`);
    }

    return developer;
  }
}
