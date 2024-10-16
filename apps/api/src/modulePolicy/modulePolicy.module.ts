import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModulePolicy, ModulePolicySchema } from './schema/modulePolicy.schema';
import { ModulePolicyService } from './modulePolicy.service';
import { ModulePolicyController } from './modulePolicy.controller';
import { ModulePolicyRepository } from './modulePolicy.repository';
import { ModulePolicySeeder } from './modulePolicy.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: ModulePolicy.name, schema: ModulePolicySchema }])],
  providers: [ModulePolicyService, ModulePolicyRepository, ModulePolicySeeder],
  exports: [ModulePolicySeeder],
  controllers: [ModulePolicyController],
})
export class ModulePolicyModule {}
