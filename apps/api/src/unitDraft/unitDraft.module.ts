import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitDraft, UnitDraftSchema } from './schema/unitDraft.schema';
import { UnitDraftService } from './unitDraft.service';
import { UnitDraftController } from './unitDraft.controller';
import { UnitDraftRepository } from './unitDraft.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: UnitDraft.name, schema: UnitDraftSchema }])],
  providers: [UnitDraftService, UnitDraftRepository],
  exports: [],
  controllers: [UnitDraftController],
})
export class UnitDraftModule {}
