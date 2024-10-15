import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/addRoleDto';
import { Role } from './schema/role.schema';
import { BadRequestException, NotFoundException } from '@bbr/api-core/modules/exceptions';
import { Types } from 'mongoose';
import { UpdateRoleDto } from './dto/updateRoleDto';
import { ListRoleDto } from './dto/listRole.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

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

    const { data, count } = await this.roleRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, roleDto);

    return { pagination, propertyTypes: data };
  }
}
