import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schema/role.schema';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>
  ) {
    super(roleModel);
  }

  async findById(roleId: string) {
    return await this.roleModel.findById(roleId).populate('modulePermissions.moduleId').exec();
  }
}
