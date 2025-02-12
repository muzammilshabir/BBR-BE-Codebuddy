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
import {
  BrandActivityLog,
  BrandActivityLogSchema,
} from 'src/brand-activity-log/schema/brand-activity-log.schema';
import { BrandActivityLogRepository } from 'src/brand-activity-log/brand-activity-log.repository';
import { RedisModule } from 'src/redis/redis.module';
import {
  RankingCategory,
  RankingCategorySchema,
} from 'src/rankingCategory/schema/rankingCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
    MongooseModule.forFeature([{ name: BrandCategory.name, schema: BrandCategorySchema }]),
    MongooseModule.forFeature([{ name: BrandDraft.name, schema: BrandDraftSchema }]),
    MongooseModule.forFeature([{ name: BrandActivityLog.name, schema: BrandActivityLogSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    ResidenceModule,
    RedisModule,
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
