import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceService, ResidenceServiceSchema } from './schema/residenceService.schema';
import { ResidenceServicesService } from './residenceService.service';
import { ResidenceServiceController } from './residenceService.controller';
import { ResidenceServiceRepository } from './residenceService.repository';
import { ResidenceServiceSeeder } from './residenceService.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceService.name, schema: ResidenceServiceSchema }]),
  ],
  providers: [ResidenceServicesService, ResidenceServiceRepository, ResidenceServiceSeeder],
  exports: [ResidenceServiceSeeder],
  controllers: [ResidenceServiceController],
})
export class ResidenceServiceModule {}
