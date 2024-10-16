import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RankingCategoryService } from './rankingCategory.service';
import { RankingCategoryController } from './rankingCategory.controller';
import { RankingCategory, RankingCategorySchema } from './schema/rankingCategory.schema';
import { RankingCategoryRepository } from './rankingCategory.repository';
import { LifeStyleRepository } from '../lifestyles/lifeStyle.repository';
import { PropertyTypeRepository } from '../propertyType/propertyType.repository';
import { LifeStyle, LifeStyleSchema } from '../lifestyles/schema/lifeStyle.schema';
import { PropertyType, PropertyTypeSchema } from '../propertyType/schema/propertyType.schema';
import { RankingCategoryDraftRepository } from '../rankingCategoryDraft/rankingCategoryDraft.repository';
import {
  RankingCategoryDraft,
  RankingCategoryDraftSchema,
} from '../rankingCategoryDraft/schema/rankingCategoryDraft.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: PropertyType.name, schema: PropertyTypeSchema }]),
    MongooseModule.forFeature([
      { name: RankingCategoryDraft.name, schema: RankingCategoryDraftSchema },
    ]),
  ],
  controllers: [RankingCategoryController],
  providers: [
    RankingCategoryService,
    RankingCategoryRepository,
    LifeStyleRepository,
    PropertyTypeRepository,
    RankingCategoryDraftRepository,
  ],
})
export class RankingCategoryModule {}
