import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandCategory, BrandCategorySchema } from './schema/brandCategory.schema';
import { BrandCategoryRepository } from './brandCategoryRepository.repository';
import { BrandCategorySeeder } from './brandCategory.seeder';
import { BrandCategoryFixture } from './brandCategory.fixture';
import { BrandController } from './brandCategory.controller';
import { BrandCategoryService } from './brandCategory.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: BrandCategory.name, schema: BrandCategorySchema }])],
  providers: [
    BrandCategoryRepository,
    BrandCategorySeeder,
    BrandCategoryFixture,
    BrandCategoryService,
  ],
  exports: [BrandCategorySeeder, BrandCategoryFixture, BrandCategoryService],
  controllers: [BrandController],
})
export class BrandCategoryModule {}
