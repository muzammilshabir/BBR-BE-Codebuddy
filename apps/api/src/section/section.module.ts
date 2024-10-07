import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from './schema/section.schema';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { SectionRepository } from './section.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }])],
  providers: [SectionService, SectionRepository],
  exports: [],
  controllers: [SectionController],
})
export class ResidenceTypeModule {}
