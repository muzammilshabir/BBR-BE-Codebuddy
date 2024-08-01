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
  static TAG_PRIVATE_HOMES = 'TAG_PRIVATE_HOMES';
  static TAG_RITZ_CARLTON = 'TAG_RITZ_CARLTON';
  static TAG_ASTON_MARTIN = 'TAG_ASTON_MARTIN';
  static TAG_FOUR_SEASONS = 'TAG_FOUR_SEASONS';

  async load(): Promise<void> {
    const privateHomes = await this.brandModel.create({ name: 'Private Homes' });
    const ritzCarlton = await this.brandModel.create({ name: 'The Ritz-Carlton' });
    const astonMartin = await this.brandModel.create({ name: 'Aston Martin' });
    const fourSeasons = await this.brandModel.create({ name: 'Four Seasons' });

    this.addReference(BrandFixture.TAG_PRIVATE_HOMES, privateHomes);
    this.addReference(BrandFixture.TAG_RITZ_CARLTON, ritzCarlton);
    this.addReference(BrandFixture.TAG_ASTON_MARTIN, astonMartin);
    this.addReference(BrandFixture.TAG_FOUR_SEASONS, fourSeasons);
  }
}