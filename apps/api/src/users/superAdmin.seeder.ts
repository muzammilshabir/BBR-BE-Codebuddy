import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { RoleRepository } from '../role/role.repository';
import { UserRole, SignupMethod, UserStatus } from './enum/user.enum';
import { ModulePolicyRepository } from '../modulePolicy/modulePolicy.repository';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { RoleService } from '../role/role.service';
import * as argon from 'argon2';

@Injectable()
export class SuperAdminSeeder extends AbstractSeeder {
  public name = SuperAdminSeeder.name;
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly modulePolicyRepository: ModulePolicyRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly roleService: RoleService
  ) {
    super();
  }

  async seed() {
    try {
      let superAdminRole = await this.roleService.findSuperAdmin();

      // Fetch all available ModulePolicies
      const modulePolicies = await this.modulePolicyRepository.findAll({});

      if (!modulePolicies.data.length) {
        this.logger.warn('No ModulePolicies found');
        return;
      }

      // Create or fetch the Super Admin role

      if (!superAdminRole) {
        // Map the modulePolicies.data to match the schema structure
        const permissions = modulePolicies.data.map((policy) => {
          return {
            moduleId: policy._id as Types.ObjectId,
            permissions: ['read', 'edit', 'delete'],
          };
        });

        superAdminRole = await this.roleRepository.create({
          roleName: 'super admin',
          modulePermissions: permissions,
          isDeleted: false,
        });
      } else {
        this.logger.log('Super Admin role already exists.');
      }

      //  Create or fetch the Super Admin user
      const adminUser = await this.userRepository.find({ email: 'tiyodo7791@paxnw.com' });
      if (!adminUser) {
        await this.userRepository.create({
          email: 'tiyodo7791@paxnw.com',
          password: await argon.hash('Pass@123'), // Ensure to hash this password
          roleId: superAdminRole?._id as Types.ObjectId,
          role: UserRole.ADMIN,
          fullName: 'Super Admin',
          signupMethod: SignupMethod.EMAIL,
          isVerified: true,
          emailVerified: true,
          status: UserStatus.ACTIVE,
        });

        this.logger.log('Super Admin user created successfully.');
      } else {
        this.logger.log('Admin user already exists.');
      }
    } catch (error) {
      this.logger.error('Error while seeding users:', error);
    }
  }
}
