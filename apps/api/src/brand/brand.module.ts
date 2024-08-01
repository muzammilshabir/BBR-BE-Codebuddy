import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schema/brand.schema';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from './brand.repository';
import { BrandSeeder } from './brand.seeder';
import { BrandFixture } from './brand.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }])],
  providers: [BrandService, BrandRepository, BrandSeeder,BrandFixture],
  exports: [BrandSeeder,BrandFixture],
  controllers: [BrandController],
})
export class BrandModule {}