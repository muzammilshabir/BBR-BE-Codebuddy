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
import { BrandDraft, BrandDraftSchema } from '../brandDraft/schema/brandDraft.schema';
import { BrandDraftRepository } from '../brandDraft/brandDraft.repository';
import { ResidenceModule } from '../residences/residences.module';
import { BrandActivityLog, BrandActivityLogSchema } from 'src/brand-activity-log/schema/brand-activity-log.schema';
import { BrandActivityLogRepository } from 'src/brand-activity-log/brand-activity-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: BrandCategory.name, schema: BrandCategorySchema }]),
    MongooseModule.forFeature([{ name: BrandDraft.name, schema: BrandDraftSchema }]),
    MongooseModule.forFeature([{ name: BrandActivityLog.name, schema: BrandActivityLogSchema }]),
    ResidenceModule,
  ],
  providers: [
    BrandService,
    BrandRepository,
    BrandSeeder,
    BrandFixture,
    BrandCategoryRepository,
    BrandDraftRepository,
    BrandActivityLogRepository,
  ],
  exports: [BrandSeeder, BrandFixture],
  controllers: [BrandController],
})
export class BrandModule {}
