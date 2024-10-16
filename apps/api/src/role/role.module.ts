import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schema/role.schema';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],
  providers: [RoleService, RoleRepository],
  exports: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
