import { Injectable, Logger } from '@nestjs/common';
import { BrandRepository } from './brand.repository';
import { BrandCategoryRepository } from '../brandCategory/brandCategoryRepository.repository';
import { AbstractSeeder } from '@bbr/api-core/modules/seeder/abstractSeeder.service';
import { BrandCategoryEnum } from '../brandCategory/enum/brandCategory-enum';
import { Types } from 'mongoose';

@Injectable()
export class BrandSeeder extends AbstractSeeder {
  public name = BrandSeeder.name;
  private readonly logger = new Logger(BrandSeeder.name);

  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandCategoryRepository: BrandCategoryRepository
  ) {
    super();
  }

  async seed() {
    try {
      const luxuryHotelCategory = await this.brandCategoryRepository.find({
        name: BrandCategoryEnum.LUXURY_HOTEL_AND_RESORT,
      });

      const automotiveCategory = await this.brandCategoryRepository.find({
        name: BrandCategoryEnum.AUTOMOTIVE,
      });

      const fashionCategory = await this.brandCategoryRepository.find({
        name: BrandCategoryEnum.FASHION_AND_LIFESTYLE,
      });

      const otherCategory = await this.brandCategoryRepository.find({
        name: BrandCategoryEnum.OTHER,
      });

      if (!luxuryHotelCategory || !automotiveCategory || !fashionCategory || !otherCategory) {
        throw new Error('One or more BrandCategory documents not found');
      }

      const brands = [
        {
          name: 'Alila Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Aman Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Anantara Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Ascott Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Banyan Tree Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Belmond Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Capella Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Cheval Blanc Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Cheval Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'CitizenM Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Club Med Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Club Quarters Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Como Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Conrad Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'DAMAC Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Discovery Land Company Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Dorchester Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Edition Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Emaar Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'EMAAR Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Equinox Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Fairmont Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Four Points Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Four Seasons Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Grand Hyatt Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Hard Rock Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Hilton Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Hyatt Centric Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'InterContinental Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Jumeirah Living Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'JW Marriott Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Kempinski Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Kerzner International Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Mandarin Oriental Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Marriott Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'ME by Meliá Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Montage Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Morgans Hotel Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Mövenpick Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Nobu Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Oberoi Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'One&Only Private Homes',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'One&Only Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Park Hyatt Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Peninsula Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Radisson Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Raffles Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Regent Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Ritz-Carlton Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Rosewood Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Sandals Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Shangri-La Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Six Senses Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'SOBHA Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Sofitel Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Soneva Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'St. Regis Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Swissôtel Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Taj Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'The Chedi Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'The Langham Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'The Peninsula Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'W Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Waldorf Astoria Residences',
          brandCategoryId: luxuryHotelCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Aston Martin Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Bentley Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Bugatti Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Ferrari Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Lamborghini Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Mercedes-Benz Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Porsche Design Tower Residences',
          brandCategoryId: automotiveCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Accor Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Armani Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Baccarat Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Bvlgari Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Cavalli Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Diesel Living Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Dorchester Collection Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Elie Saab Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Fendi Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Giorgio Armani Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Hermès Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Karl Lagerfeld Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Kenzo Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'LVMH Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Missoni Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Palazzo Versace Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Paramount Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Ralph Lauren Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Related Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Roberto Cavalli Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'SLS Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Tommy Hilfiger Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Trump Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Versace Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Virgin Limited Edition Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Yoo by Philippe Starck Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
        {
          name: 'Yoo Residences',
          brandCategoryId: fashionCategory._id,
          upload: [
            { ImageId: new Types.ObjectId(), type: 'main' },
            { ImageId: new Types.ObjectId(), type: 'secondary' },
          ],
        },
      ];

      for (const brand of brands) {
        await this.brandRepository.upsert({ name: brand.name }, brand);
      }
    } catch (error) {
      this.logger.error('Error seeding brands', error);
    }
  }
}
