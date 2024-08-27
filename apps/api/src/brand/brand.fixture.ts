import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { UploadFixture } from '../upload/upload.fixture';
import { BrandCategoryFixture } from '../brandCategory/brandCategory.fixture';

@Injectable()
export class BrandFixture extends AbstractFixture {
  public dependsOn = [UploadFixture, BrandCategoryFixture];
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) {
    super();
  }

  name = BrandFixture.name;
  static BRAND_PRIVATE_HOMES = 'BRAND_PRIVATE_HOMES';
  static BRAND_RITZ_CARLTON = 'BRAND_RITZ_CARLTON';
  static BRAND_ASTON_MARTIN = 'BRAND_ASTON_MARTIN';
  static BRAND_FOUR_SEASONS = 'BRAND_FOUR_SEASONS';

  async load(): Promise<void> {
    const luxuryHotelCategoryId = this.getReference(
      BrandCategoryFixture.BRAND_CATEGORY_LUXURY_HOTEL_AND_RESORT
    )._id;
    const automotiveCategoryId = this.getReference(
      BrandCategoryFixture.BRAND_CATEGORY_AUTOMOTIVE
    )._id;
    const fashionAndLifestyleCategoryId = this.getReference(
      BrandCategoryFixture.BRAND_CATEGORY_FASHION_AND_LIFESTYLE
    )._id;

    const sampleUploadId = this.getReference(UploadFixture.UPLOAD_1)._id;

    const privateHomes = await this.brandModel.create({
      name: 'Private Homes',
      brandCategoryId: luxuryHotelCategoryId,
      upload: [
        { ImageId: sampleUploadId, type: 'main' },
        { ImageId: sampleUploadId, type: 'secondary' },
      ],
    });

    const ritzCarlton = await this.brandModel.create({
      name: 'The Ritz-Carlton',
      brandCategoryId: luxuryHotelCategoryId,
      upload: [{ ImageId: sampleUploadId, type: 'main' }],
    });

    const astonMartin = await this.brandModel.create({
      name: 'Aston Martin',
      brandCategoryId: automotiveCategoryId,
      upload: [
        { ImageId: sampleUploadId, type: 'advertisement' },
        { ImageId: sampleUploadId, type: 'logo' },
      ],
    });

    const fourSeasons = await this.brandModel.create({
      name: 'Four Seasons',
      brandCategoryId: luxuryHotelCategoryId,
      upload: [
        { ImageId: sampleUploadId, type: 'main' },
        { ImageId: sampleUploadId, type: 'brochure' },
      ],
    });

    // Add references to the fixture
    this.addReference(BrandFixture.BRAND_PRIVATE_HOMES, privateHomes);
    this.addReference(BrandFixture.BRAND_RITZ_CARLTON, ritzCarlton);
    this.addReference(BrandFixture.BRAND_ASTON_MARTIN, astonMartin);
    this.addReference(BrandFixture.BRAND_FOUR_SEASONS, fourSeasons);
  }
}
