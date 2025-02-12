import { Injectable } from '@nestjs/common';
import { CountryRepository } from './country.repository';
import { ListCountryDto } from './dto/listCountry.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateCountryDto } from './dto/updateCountry.dto';
import * as XLSX from 'xlsx';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';

@Injectable()
export class CountryService {
  constructor(
    private readonly countryRepository: CountryRepository,
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {}

  async findAll(listCountryDto: ListCountryDto) {
    const { search, hasRankingCategory } = listCountryDto;

    // Base filter: search & active status
    const filter: any = search
      ? {
          $or: [{ name: { $regex: search, $options: 'i' } }],
          active: true,
        }
      : { active: true };

    // If hasRankingCategory is true, fetch relevant countries
    if (hasRankingCategory) {
      const rankingCountries = await this.rankingCategoryModel.distinct('countryId', {});

      if (rankingCountries.length) {
        filter._id = { $in: rankingCountries };
      }
    }

    const options = PaginationService.prepareOptions(listCountryDto);

    const { data, count } = await this.countryRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      { path: 'geographicalAreasId', select: 'slug' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listCountryDto);

    return { pagination, countries: data };
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }

    return await this.countryRepository.update(id, updateCountryDto);
  }

  async getCountryById(countryId: string): Promise<any> {
    return await this.countryRepository.findByIdInDetail(countryId);
  }

  async processCountrySeeder(file: Express.Multer.File) {
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
        console.log(
          `Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(jsonData.length / BATCH_SIZE)}`
        );

        try {
          // Process each country in the batch
          const countryPromises = batch.map(async (row) => {
            const countryData = {
              name: row['name']?.toString(),
              countryCode: row['iso2']?.toString(),
              phoneCode: row['phone_code']?.toString(),
              active: false,
              isDeleted: false,
            };

            const foundCountry = await this.countryRepository.find({
              name: {
                $regex: `^${countryData.name.replace(/[()]/g, '\\$&')}$`,
                $options: 'i',
              },
              isDeleted: false,
            });
            if (foundCountry) {
              await this.countryRepository.update(foundCountry._id, countryData);
            } else {
              await this.countryRepository.create(countryData);
            }
          });

          // Save batch
          const savedBatch = await Promise.all(countryPromises);
          processedCount += batch.length;
          savedCount += savedBatch.length;

          console.log(`Saved ${savedBatch.length} countries. Total processed: ${processedCount}`);

          // Optional: Add small delay between batches
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error);
          continue; // Continue with next batch even if current fails
        }
      }

      const countries = [
        { name: 'USA', active: true, isDeleted: false },
        { name: 'United Arab Emirates', active: true, isDeleted: false },
        { name: 'United Kingdom', active: true, isDeleted: false },
        { name: 'Thailand', active: true, isDeleted: false },
        { name: 'France', active: true, isDeleted: false },
        { name: 'Japan', active: true, isDeleted: false },
        { name: 'Australia', active: true, isDeleted: false },
        { name: 'Spain', active: true, isDeleted: false },
        { name: 'Switzerland', active: true, isDeleted: false },
        { name: 'Singapore', active: true, isDeleted: false },
        { name: 'Hong Kong S.A.R.', active: true, isDeleted: false },
        { name: 'Philippines', active: true, isDeleted: false },
        { name: 'Malaysia', active: true, isDeleted: false },
        { name: 'Turkey', active: true, isDeleted: false },
        { name: 'South Africa', active: true, isDeleted: false },
        { name: 'Canada', active: true, isDeleted: false },
        { name: 'Austria', active: true, isDeleted: false },
        { name: 'Italy', active: true, isDeleted: false },
        { name: 'Greece', active: true, isDeleted: false },
        { name: 'Portugal', active: true, isDeleted: false },
        { name: 'China', active: true, isDeleted: false },
        { name: 'Indonesia', active: true, isDeleted: false },
        { name: 'Maldives', active: true, isDeleted: false },
        { name: 'Brazil', active: true, isDeleted: false },
        { name: 'Morocco', active: true, isDeleted: false },
        { name: 'Monaco', active: true, isDeleted: false },
        { name: 'Argentina', active: true, isDeleted: false },
        { name: 'Chile', active: true, isDeleted: false },
        { name: 'Qatar', active: true, isDeleted: false },
        { name: 'New Zealand', active: true, isDeleted: false },
        { name: 'Nigeria', active: true, isDeleted: false },
        { name: 'Vietnam', active: true, isDeleted: false },
        { name: 'South Korea', active: true, isDeleted: false },
        { name: 'Taiwan', active: true, isDeleted: false },
        { name: 'Saudi Arabia', active: true, isDeleted: false },
        { name: 'Oman', active: true, isDeleted: false },
        { name: 'Mexico', active: true, isDeleted: false },
        { name: 'Bahamas', active: true, isDeleted: false },
        { name: 'Dominican Republic', active: true, isDeleted: false },
        { name: 'Jamaica', active: true, isDeleted: false },
        { name: 'Turks and Caicos', active: true, isDeleted: false },
        { name: 'Puerto Rico', active: true, isDeleted: false },
        { name: 'Colombia', active: true, isDeleted: false },
        { name: 'Peru', active: true, isDeleted: false },
      ];

      for (const country of countries) {
        await this.countryRepository.updateWithFilter(
          { name: { $regex: `^${country.name.replace(/[()]/g, '\\$&')}$` }, isDeleted: false },
          { $set: { active: true } }
        );
      }

      return {
        success: true,
        message: `Successfully processed ${processedCount} rows and saved ${savedCount} countries`,
        totalProcessed: processedCount,
        savedCount: savedCount,
      };
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw new Error(`Failed to process country seeder: ${error.message}`);
    }
  }
}
