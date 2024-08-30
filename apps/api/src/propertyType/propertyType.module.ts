import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyType, PropertyTypeSchema } from './schema/propertyType.schema';
import { PropertyTypeService } from './propertyType.service';
import { PropertyTypeController } from './propertyType.controller';
import { PropertyTypeRepository } from './propertyType.repository';
import { PropertyTypeSeeder } from './propertyType.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }])],
  providers: [PropertyTypeService, PropertyTypeRepository, PropertyTypeSeeder],
  exports: [PropertyTypeSeeder],
  controllers: [PropertyTypeController],
})
export class PropertyTypeModule {}
