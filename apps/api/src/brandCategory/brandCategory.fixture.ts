import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandCategory } from './schema/brandCategory.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';
import { BrandCategoryEnum } from './enum/brandCategory-enum';

@Injectable()
export class BrandCategoryFixture extends AbstractFixture {
  constructor(
    @InjectModel(BrandCategory.name) private readonly brandCategoryModel: Model<BrandCategory>
  ) {
    super();
  }

  name = BrandCategoryFixture.name;
  static BRAND_CATEGORY_LUXURY_HOTEL_AND_RESORT = 'BRAND_CATEGORY_LUXURY_HOTEL_AND_RESORT';
  static BRAND_CATEGORY_AUTOMOTIVE = 'BRAND_CATEGORY_AUTOMOTIVE';
  static BRAND_CATEGORY_FASHION_AND_LIFESTYLE = 'BRAND_CATEGORY_FASHION_AND_LIFESTYLE';

  async load(): Promise<void> {
    const luxuryHotelAndResort = await this.brandCategoryModel.create({
      name: BrandCategoryEnum.LUXURY_HOTEL_AND_RESORT,
    });
    const automotive = await this.brandCategoryModel.create({
      name: BrandCategoryEnum.AUTOMOTIVE,
    });
    const fashionAndLifestyle = await this.brandCategoryModel.create({
      name: BrandCategoryEnum.FASHION_AND_LIFESTYLE,
    });

    this.addReference(
      BrandCategoryFixture.BRAND_CATEGORY_LUXURY_HOTEL_AND_RESORT,
      luxuryHotelAndResort
    );
    this.addReference(BrandCategoryFixture.BRAND_CATEGORY_AUTOMOTIVE, automotive);
    this.addReference(
      BrandCategoryFixture.BRAND_CATEGORY_FASHION_AND_LIFESTYLE,
      fashionAndLifestyle
    );
  }
}
