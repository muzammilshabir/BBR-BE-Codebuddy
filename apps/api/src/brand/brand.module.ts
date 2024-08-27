import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schema/brand.schema';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from './brand.repository';
import { BrandSeeder } from './brand.seeder';
import { BrandFixture } from './brand.fixture';
import { BrandCategoryRepository } from '../brandCategory/brandCategoryRepository.repository';
import { BrandCategory, BrandCategorySchema } from '../brandCategory/schema/brandCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: BrandCategory.name, schema: BrandCategorySchema }]),
  ],
  providers: [BrandService, BrandRepository, BrandSeeder, BrandFixture, BrandCategoryRepository],
  exports: [BrandSeeder, BrandFixture],
  controllers: [BrandController],
})
export class BrandModule {}
