import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeStyle, LifeStyleSchema } from './schema/lifeStyle.schema';
import { ListLifeStyleService } from './lifeStyles.service';
import { LifeStyleController } from './lifeStyles.controller';
import { LifeStyleRepository } from './lifeStyle.repository';
import { LifeStyleSeeder } from './lifeStyle.seeder';
import { LifeStyleFixture } from './lifeStyle.fixture';
import { RankingCategory, RankingCategorySchema } from 'src/rankingCategory/schema/rankingCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }]),
    MongooseModule.forFeature([{ name: RankingCategory.name, schema: RankingCategorySchema }]),
  ],
  providers: [ListLifeStyleService, LifeStyleRepository, LifeStyleSeeder, LifeStyleFixture],
  exports: [LifeStyleSeeder, LifeStyleFixture],
  controllers: [LifeStyleController],
})
export class LifeStyleModule {}
