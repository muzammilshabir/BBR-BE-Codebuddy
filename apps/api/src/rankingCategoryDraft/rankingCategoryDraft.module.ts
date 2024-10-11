import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingCategoryDraftService } from './rankingCategoryDraft.service';
import { RankingCategoryDraftController } from './rankingCategoryDraft.controller';
import { RankingCategoryDraftRepository } from './rankingCategoryDraft.repository';
import {
  RankingCategoryDraft,
  RankingCategoryDraftSchema,
} from './schema/rankingCategoryDraft.schema';
import { RankingCategoryModule } from '../rankingCategory/rankingCategory.module';
import {
  RankingCategory,
  RankingCategorySchema,
} from '../rankingCategory/schema/rankingCategory.schema';
import { RankingCategoryRepository } from '../rankingCategory/rankingCategory.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RankingCategoryDraft.name, schema: RankingCategoryDraftSchema },
    ]),
    RankingCategoryModule,
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
  ],
  providers: [
    RankingCategoryDraftService,
    RankingCategoryDraftRepository,
    RankingCategoryRepository,
  ],
  exports: [RankingCategoryDraftService],
  controllers: [RankingCategoryDraftController],
})
export class RankingCategoryDraftModule {}
