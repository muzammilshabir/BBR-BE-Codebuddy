import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from './schema/section.schema';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { SectionRepository } from './section.repository';
import { SectionSeeder } from './section.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }])],
  providers: [SectionService, SectionRepository, SectionSeeder],
  exports: [SectionSeeder],
  controllers: [SectionController],
})
export class SectionModule {}
