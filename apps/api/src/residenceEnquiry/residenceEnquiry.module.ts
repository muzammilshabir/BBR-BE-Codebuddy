import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidenceEnquiry, ResidenceEnquirySchema } from './schema/residenceEnquiry.schema';
import { ResidenceEnquiryService } from './residenceEnquiry.service';
import { ResidenceEnquiryController } from './residenceEnquiry.controller';
import { ResidenceEnquiryRepository } from './residenceEnquiry.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResidenceEnquiry.name, schema: ResidenceEnquirySchema }]),
  ],
  providers: [ResidenceEnquiryService, ResidenceEnquiryRepository],
  exports: [],
  controllers: [ResidenceEnquiryController],
})
export class ResidenceEnquiryModule {}
