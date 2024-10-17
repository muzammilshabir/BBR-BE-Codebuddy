import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/addRoleDto';
import { Role } from './schema/role.schema';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';
import { UpdateRoleDto } from './dto/updateRoleDto';
import { ListRoleDto } from './dto/listRole.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { User } from '../users/schema/user.schema';
import { PermissionLevel } from '../modulePolicy/enum/permission-enum';
import { GetRoleByIdDto } from './dto/getRoleById.dto';

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

  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto, userId: string): Promise<Role> {
    try {
      const { userType } = updateRoleDto;
      let { roleName } = updateRoleDto;

      if (roleName) {
        roleName = roleName.toLowerCase();

        // Check if another role with the same name and userType exists, excluding the current role
        const existingRole = await this.roleRepository.find({
          _id: { $ne: new Types.ObjectId(roleId) }, // Exclude the current role
          roleName,
          userType,
        });

        if (existingRole) {
          throw new BadRequestException(
            `Role with name "${roleName}" already exists for user type "${userType}".`
          );
        }
      }

      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID "${roleId}" not found`);
      }

      const updatedData = roleName
        ? { ...updateRoleDto, roleName, updatedById: new Types.ObjectId(userId) }
        : { ...updateRoleDto, updatedById: new Types.ObjectId(userId) };

      Object.assign(role, updatedData);
      return await role.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(roleDto: ListRoleDto) {
    const filter = roleDto.search
      ? {
          $or: [{ roleName: { $regex: roleDto.search, $options: 'i' } }],
        }
      : {};

    const options = PaginationService.prepareOptions(roleDto);

    const { data, count } = await this.roleRepository.findAll(filter, options, [
      { path: 'modulePermissions.moduleId', model: 'ModulePolicy' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, roleDto);

    return { pagination, propertyTypes: data };
  }

  async hasPermission(
    user: User,
    requiredPermissions: { module: string; permission: PermissionLevel }
  ): Promise<boolean> {
    const role = await this.roleRepository.findById(user.roleId.toString());
    if (!role) {
      return false;
    }

    const modulePolicy = role.modulePermissions.find((modulePermission: any) => {
      return modulePermission.moduleId?.slug === requiredPermissions.module;
    });

    if (!modulePolicy) {
      // Module not assigned to the role
      return false;
    }

    const hasRequiredPermission = modulePolicy.permissions.includes(requiredPermissions.permission);

    return hasRequiredPermission;
  }

  async findSuperAdmin(): Promise<Role> {
    return await this.roleRepository.find({ roleName: 'super admin' });
  }

  async getRoleById(getRoleByIdDto: GetRoleByIdDto): Promise<any> {
    const residenceDetails = await this.roleRepository.findById(getRoleByIdDto.roleId);
    return residenceDetails;
  }
}
