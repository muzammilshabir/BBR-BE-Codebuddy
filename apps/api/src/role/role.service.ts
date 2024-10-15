import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/addRoleDto';
import { Role } from './schema/role.schema';
import { BadRequestException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}
  async createRole(userId: string, createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const { userType } = createRoleDto;
      let { roleName } = createRoleDto;

      // Convert roleName to lowercase to avoid case-sensitive duplication
      roleName = roleName.toLowerCase();

      const existingRole = await this.roleRepository.find({ roleName, userType });
      if (existingRole) {
        throw new BadRequestException(
          `Role with name "${roleName}" already exists for user type "${userType}".`
        );
      }

      return await this.roleRepository.create({
        ...createRoleDto,
        roleName,
        createdById: new Types.ObjectId(userId),
      });
    } catch (error) {
      throw error;
    }
  }
}
