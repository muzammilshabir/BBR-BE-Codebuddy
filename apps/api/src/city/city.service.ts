import { Injectable } from '@nestjs/common';
import { CityRepository } from './city.repository';
import { ListCityDto } from './dto/listCity.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateCityDto } from './dto/updateCity.dto';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import mongoose, { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { StateRepository } from 'src/state/state.repository';
import { CountryRepository } from 'src/country/country.repository';
import { InjectModel } from '@nestjs/mongoose';
import { RankingCategory } from 'src/rankingCategory/schema/rankingCategory.schema';

@Injectable()
export class CityService {
  constructor(
    private readonly cityRepository: CityRepository,
    private readonly stateRepository: StateRepository,
    private readonly countryRepository: CountryRepository,
    @InjectModel(RankingCategory.name) private readonly rankingCategoryModel: Model<RankingCategory>
  ) {}

  async findAll(listCityDto: ListCityDto) {
    const { search, countryId, hasRankingCategory } = listCityDto;

    // Base filter: search & active status
    let filter: any = search
      ? {
          $or: [{ name: { $regex: search, $options: 'i' } }],
          active: true,
        }
      : { active: true };

    if (countryId) {
      filter = { ...filter, countryId: new mongoose.Types.ObjectId(countryId) };
    }

    // If hasRankingCategory is true, fetch relevant cities
    if (hasRankingCategory) {
        const rankingCities = await this.rankingCategoryModel.distinct('cityId', {});

        if (rankingCities.length) {
            filter._id = { $in: rankingCities };
        }
    }

    const options = PaginationService.prepareOptions(listCityDto);

    const { data, count } = await this.cityRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      {
        path: 'countryId',
        select: 'slug name',
        populate: { path: 'geographicalAreasId', select: 'slug' },
      },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listCityDto);

    return { pagination, cities: data };
}

  async update(id: string, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new NotFoundException(`City with id ${id} not found`);
    }

    return await this.cityRepository.update(id, updateCityDto);
  }

  async getCityById(cityId: string): Promise<any> {
    return await this.cityRepository.findByIdInDetail(cityId);
  }

  async processCitySeeder(file: Express.Multer.File) {
    // Start processing in background
    this.processInBackground(file);

    // Return immediately
    return {
      success: true,
      message: 'City seeding process started. Please wait and check after sometime.',
      status: 'PROCESSING',
    };
  }

  private async processInBackground(file: Express.Multer.File) {
    setTimeout(async () => {
      try {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const BATCH_SIZE = 75;
        const DELAY_BETWEEN_BATCHES = 700;

        for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
          console.log(new Date().toISOString());
          const batch = jsonData.slice(i, i + BATCH_SIZE);
          console.log(
            `Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(jsonData.length / BATCH_SIZE)}`
          );

          try {
            const cityPromises = batch.map(async (row) => {
              // First, verify that both state and country exist
              let stateId = undefined;
              let countryId = undefined;

              // Verify country exists
              if (row['country_code']) {
                const country = await this.countryRepository.find({
                  countryCode: row['country_code'],
                  isDeleted: false,
                });
                if (country) {
                  countryId = country._id;
                } else {
                  console.warn(
                    `Country with code ${row['country_code']} not found, skipping city ${row['name']}`
                  );
                  return;
                }
              }

              // Verify state exists if state_code is provided
              if (row['state_code'] && countryId) {
                const state = await this.stateRepository.find({
                  stateCode: row['state_code'],
                  countryId: countryId,
                  isDeleted: false,
                });
                if (state) {
                  stateId = state._id;
                } else {
                  console.warn(
                    `State with code ${row['state_code']} not found for country ${row['country_code']}, skipping city ${row['name']}`
                  );
                  return;
                }
              }

              const cityData = {
                name: row['name'],
                stateCode: row['state_code'],
                countryCode: row['country_code'],
                stateId: stateId,
                countryId: countryId,
                active: false,
                isDeleted: false,
              };

              // Skip if required countryId is missing
              if (!cityData.countryId) {
                console.warn(`Missing required countryId for city ${cityData.name}, skipping`);
                return;
              }

              const foundCity = await this.cityRepository.find({
                name: {
                  $regex: `^${cityData.name.replace(/[()]/g, '\\$&')}$`,
                  $options: 'i',
                },
                countryId: cityData.countryId,
                isDeleted: false,
              });

              if (foundCity) {
                await this.cityRepository.update(foundCity._id.toString(), cityData);
              } else {
                await this.cityRepository.create(cityData);
              }
            });

            await Promise.all(cityPromises);

            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
          } catch (error) {
            console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            i -= BATCH_SIZE;
            continue;
          }
        }

        const cities = [
          { name: 'Miami', active: true, isDeleted: false },
          { name: 'Dubai', active: true, isDeleted: false },
          { name: 'New York', active: true, isDeleted: false },
          { name: 'London', active: true, isDeleted: false },
          { name: 'Bangkok', active: true, isDeleted: false },
          { name: 'Los Angeles', active: true, isDeleted: false },
          { name: 'Hong Kong', active: true, isDeleted: false },
          { name: 'Singapore', active: true, isDeleted: false },
          { name: 'Paris', active: true, isDeleted: false },
          { name: 'Tokyo', active: true, isDeleted: false },
          { name: 'Sydney', active: true, isDeleted: false },
          { name: 'Toronto', active: true, isDeleted: false },
          { name: 'Istanbul', active: true, isDeleted: false },
          { name: 'Manila', active: true, isDeleted: false },
          { name: 'Kuala Lumpur', active: true, isDeleted: false },
          { name: 'Cape Town', active: true, isDeleted: false },
          { name: 'Melbourne', active: true, isDeleted: false },
          { name: 'Barcelona', active: true, isDeleted: false },
          { name: 'Vienna', active: true, isDeleted: false },
          { name: 'Zurich', active: true, isDeleted: false },
          { name: 'Chicago', active: true, isDeleted: false },
          { name: 'Shanghai', active: true, isDeleted: false },
          { name: 'Beijing', active: true, isDeleted: false },
          { name: 'Bali', active: true, isDeleted: false },
          { name: 'Male', active: true, isDeleted: false },
          { name: 'Rio de Janeiro', active: true, isDeleted: false },
          { name: 'São Paulo', active: true, isDeleted: false },
          { name: 'Marrakech', active: true, isDeleted: false },
          { name: 'Monaco', active: true, isDeleted: false },
          { name: 'Nice', active: true, isDeleted: false },
          { name: 'Lisbon', active: true, isDeleted: false },
          { name: 'Rome', active: true, isDeleted: false },
          { name: 'Milan', active: true, isDeleted: false },
          { name: 'Athens', active: true, isDeleted: false },
          { name: 'Mykonos', active: true, isDeleted: false },
          { name: 'Phuket', active: true, isDeleted: false },
          { name: 'Koh Samui', active: true, isDeleted: false },
          { name: 'Honolulu', active: true, isDeleted: false },
          { name: 'Las Vegas', active: true, isDeleted: false },
          { name: 'San Francisco', active: true, isDeleted: false },
          { name: 'Dallas', active: true, isDeleted: false },
          { name: 'Houston', active: true, isDeleted: false },
          { name: 'Seattle', active: true, isDeleted: false },
          { name: 'Vancouver', active: true, isDeleted: false },
          { name: 'Montreal', active: true, isDeleted: false },
          { name: 'Panama City', active: true, isDeleted: false },
          { name: 'Buenos Aires', active: true, isDeleted: false },
          { name: 'Santiago', active: true, isDeleted: false },
          { name: 'Abu Dhabi', active: true, isDeleted: false },
          { name: 'Doha', active: true, isDeleted: false },
          { name: 'Monte Carlo', active: true, isDeleted: false },
          { name: 'Geneva', active: true, isDeleted: false },
          { name: 'St. Moritz', active: true, isDeleted: false },
          { name: 'Aspen', active: true, isDeleted: false },
          { name: 'Lake Como', active: true, isDeleted: false },
          { name: 'Portofino', active: true, isDeleted: false },
          { name: 'Amalfi', active: true, isDeleted: false },
          { name: 'Bora Bora', active: true, isDeleted: false },
          { name: 'Queenstown', active: true, isDeleted: false },
          { name: 'Auckland', active: true, isDeleted: false },
          { name: 'Johannesburg', active: true, isDeleted: false },
          { name: 'Lagos', active: true, isDeleted: false },
          { name: 'Ho Chi Minh City', active: true, isDeleted: false },
          { name: 'Hanoi', active: true, isDeleted: false },
          { name: 'Seoul', active: true, isDeleted: false },
          { name: 'Taipei', active: true, isDeleted: false },
          { name: 'Macau', active: true, isDeleted: false },
          { name: 'Riyadh', active: true, isDeleted: false },
          { name: 'Muscat', active: true, isDeleted: false },
          { name: 'Mexico City', active: true, isDeleted: false },
          { name: 'Cancun', active: true, isDeleted: false },
          { name: 'Punta Cana', active: true, isDeleted: false },
          { name: 'Nassau', active: true, isDeleted: false },
          { name: 'Montego Bay', active: true, isDeleted: false },
          { name: 'Providenciales', active: true, isDeleted: false },
          { name: 'San Juan', active: true, isDeleted: false },
          { name: 'Cartagena', active: true, isDeleted: false },
          { name: 'Lima', active: true, isDeleted: false },
          { name: 'Santo Domingo', active: true, isDeleted: false },
          { name: 'Medellin', active: true, isDeleted: false },
        ];

        for (const cityData of cities) {
          const city = await this.cityRepository.find({
            name: {
              $regex: `^${cityData.name.replace(/[()]/g, '\\$&')}$`,
              $options: 'i',
            },
            isDeleted: false,
          });

          if (city) {
            await this.cityRepository.update(city._id.toString(), { active: true });

            if (city.stateId) {
              await this.stateRepository.update(city.stateId.toString(), { active: true });
            }
          }
        }
      } catch (error) {
        console.error('Error processing cities:', error);
      }
    }, 0);
  }
}
