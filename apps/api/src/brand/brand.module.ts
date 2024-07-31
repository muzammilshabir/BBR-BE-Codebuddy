import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from './schema/brand.schema';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from './brand.repository';
import { BrandSeeder } from './brand.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }])],
  providers: [BrandService, BrandRepository, BrandSeeder],
  exports: [BrandSeeder],
  controllers: [BrandController],
})
export class BrandModule {}