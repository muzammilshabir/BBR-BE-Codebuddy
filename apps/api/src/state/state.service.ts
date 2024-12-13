import { Injectable, NotFoundException } from '@nestjs/common';
import { StateRepository } from './state.repository';
import { ListStateDto } from './dto/listState.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateStateDto } from './dto/updateState.dto';
import * as XLSX from 'xlsx';
import { CountryRepository } from 'src/country/country.repository';

@Injectable()
export class StateService {

    constructor(
      private readonly stateRepository: StateRepository,
      private readonly countryRepository: CountryRepository
    ) {}

    async findAll(listStateDto: ListStateDto) {
        const filter = listStateDto.search
          ? {
              $or: [{ name: { $regex: listStateDto.search, $options: 'i' } }],
              active: true,
              isDeleted: false
            }
          : {
              active: true,
            };
    
        const options = PaginationService.prepareOptions(listStateDto);
    
        const { data, count } = await this.stateRepository.findAll(filter, options, [
          { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
        ]);
    
        const { pagination } = PaginationService.paginate({ rows: data, count }, listStateDto);
    
        return { pagination, countries: data };
    }

    async update(id: string, updateStateDto: UpdateStateDto) {
      const state = await this.stateRepository.findById(id);
  
      if (!state) {
        throw new NotFoundException(`State with id ${id} not found`);
      }
  
      return await this.stateRepository.update(id, updateStateDto);
    }
  
    async getStateById(stateId: string): Promise<any> {
      return await this.stateRepository.findByIdInDetail(stateId);
    }

    async processStateSeeder(file: Express.Multer.File) {
      try {
        // Read the CSV file using XLSX
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
        const BATCH_SIZE = 1000;
        let processedCount = 0;
        let savedCount = 0;
    
        // Process in batches
        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
          const batch = jsonData.slice(i, i + BATCH_SIZE);
          
          // Log progress
          console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(jsonData.length / BATCH_SIZE)}`);
    
          try {
            // Process each state in the batch
            const statePromises = batch.map(async row => {
              // Find the corresponding country first
              const country = await this.countryRepository.find({ 
                countryCode: row['country_code']?.toString(),
                isDeleted: false 
              });
    
              if (!country) {
                console.log(`Country not found for country code: ${row['country_code']}`);
                return null;
              }
    
              const stateData = {
                name: row['name']?.toString(),
                stateCode: row['state_code']?.toString() || "",
                countryCode: row['country_code']?.toString(),
                countryId: country._id,
                isDeleted: false
              };
            // console.log(stateData)
              const foundState = await this.stateRepository.find({ 
                name: { $regex: new RegExp(stateData.name, 'i') },
                countryId: country._id,
                isDeleted: false 
              });
    
              if (foundState) {
                await this.stateRepository.updateWithFilter(
                  { 
                    name: stateData.name,
                    countryId: country._id,
                    isDeleted: false 
                  },
                  { $set: stateData }
                );
              } else {
                await this.stateRepository.create(stateData);
              }
            });
    
            // Save batch
            const savedBatch = await Promise.all(statePromises);
            processedCount += batch.length;
            savedCount += savedBatch.filter(item => item !== null).length;
    
            console.log(`Saved ${savedBatch.length} states. Total processed: ${processedCount}`);
    
            // Optional: Add small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100));
    
          } catch (error) {
            console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error);
            continue; // Continue with next batch even if current fails
          }
        }
    
        return {
          success: true,
          message: `Successfully processed ${processedCount} rows and saved ${savedCount} states`,
          totalProcessed: processedCount,
          savedCount: savedCount
        };
    
      } catch (error) {
        console.error('Error processing CSV:', error);
        throw new Error(`Failed to process state seeder: ${error.message}`);
      }
    }

}
