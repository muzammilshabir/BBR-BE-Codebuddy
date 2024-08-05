import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class BrandFixture extends AbstractFixture {
  constructor(@InjectModel(Brand.name) private readonly brandModel: Model<Brand>) {
    super();
  }

  name = BrandFixture.name;
  static BRAND_PRIVATE_HOMES = 'BRAND_PRIVATE_HOMES';
  static BRAND_RITZ_CARLTON = 'BRAND_RITZ_CARLTON';
  static BRAND_ASTON_MARTIN = 'BRAND_ASTON_MARTIN';
  static BRAND_FOUR_SEASONS = 'BRAND_FOUR_SEASONS';

  async load(): Promise<void> {
    const privateHomes = await this.brandModel.create({ name: 'Private Homes' });
    const ritzCarlton = await this.brandModel.create({ name: 'The Ritz-Carlton' });
    const astonMartin = await this.brandModel.create({ name: 'Aston Martin' });
    const fourSeasons = await this.brandModel.create({ name: 'Four Seasons' });

    this.addReference(BrandFixture.BRAND_PRIVATE_HOMES, privateHomes);
    this.addReference(BrandFixture.BRAND_RITZ_CARLTON, ritzCarlton);
    this.addReference(BrandFixture.BRAND_ASTON_MARTIN, astonMartin);
    this.addReference(BrandFixture.BRAND_FOUR_SEASONS, fourSeasons);
  }
}
