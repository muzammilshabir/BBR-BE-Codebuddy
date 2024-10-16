import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UserRole } from './enum/user.enum';

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
}
