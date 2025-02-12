import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyType, PropertyTypeSchema } from './schema/propertyType.schema';
import { PropertyTypeService } from './propertyType.service';
import { PropertyTypeController } from './propertyType.controller';
import { PropertyTypeRepository } from './propertyType.repository';
import { PropertyTypeSeeder } from './propertyType.seeder';
import {
  RankingCategory,
  RankingCategorySchema,
} from 'src/rankingCategory/schema/rankingCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
  ],
  providers: [PropertyTypeService, PropertyTypeRepository, PropertyTypeSeeder],
  exports: [PropertyTypeSeeder],
  controllers: [PropertyTypeController],
})
export class PropertyTypeModule {}
