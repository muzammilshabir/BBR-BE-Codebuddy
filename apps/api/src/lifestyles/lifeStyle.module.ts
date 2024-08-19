import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeStyle, LifeStyleSchema } from './schema/lifeStyle.schema';
import { ListLifeStyleService } from './lifeStyles.service';
import { LifeStyleController } from './lifeStyles.controller';
import { LifeStyleRepository } from './lifeStyle.repository';
import { LifeStyleSeeder } from './lifeStyle.seeder';
import { LifeStyleFixture } from './lifeStyle.fixture';

@Module({
  imports: [MongooseModule.forFeature([{ name: LifeStyle.name, schema: LifeStyleSchema }])],
  providers: [ListLifeStyleService, LifeStyleRepository, LifeStyleSeeder, LifeStyleFixture],
  exports: [LifeStyleSeeder, LifeStyleFixture],
  controllers: [LifeStyleController],
})
export class LifeStyleModule {}
