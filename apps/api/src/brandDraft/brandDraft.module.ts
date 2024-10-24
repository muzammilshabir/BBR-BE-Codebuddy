import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandDraft, BrandDraftSchema } from './schema/brandDraft.schema';
import { BrandDraftService } from './brandDraft.service';
import { BrandDraftController } from './brandDraft.controller';
import { BrandDraftRepository } from './brandDraft.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: BrandDraft.name, schema: BrandDraftSchema }])],
  providers: [BrandDraftService, BrandDraftRepository],
  exports: [],
  controllers: [BrandDraftController],
})
export class BrandDraftModule {}
