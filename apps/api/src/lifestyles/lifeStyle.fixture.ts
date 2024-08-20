import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LifeStyle } from './schema/lifeStyle.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class LifeStyleFixture extends AbstractFixture {
  constructor(@InjectModel(LifeStyle.name) private readonly lifeStyleModel: Model<LifeStyle>) {
    super();
  }

  name = LifeStyleFixture.name;
  static INVESTMENT_OPPORTUNITIES = 'INVESTMENT_OPPORTUNITIES';
  static NEWEST_BRANDED_RESIDENCES = 'NEWEST_BRANDED_RESIDENCES';
  static PET_FRIENDLY_RESIDENCES = 'PET_FRIENDLY_RESIDENCES';
  static BEACHFRONT_RESIDENCES = 'BEACHFRONT_RESIDENCES';
  static GOLF_RESIDENCES = 'GOLF_RESIDENCES';
  static EMERGING_MARKETS = 'EMERGING_MARKETS';
  static BEST_FOR_COUPLES = 'BEST_FOR_COUPLES';
  static SKI_RESORT = 'SKI_RESORT';

  async load(): Promise<any> {
    const ls1 = await this.lifeStyleModel.create({ name: 'Investment Opportunities' });
    const ls2 = await this.lifeStyleModel.create({ name: 'Newest Branded Residences' });
    const ls3 = await this.lifeStyleModel.create({ name: 'Pet Friendly Residences' });
    const ls4 = await this.lifeStyleModel.create({ name: 'Beachfront Residences' });
    const ls5 = await this.lifeStyleModel.create({ name: 'Golf Residences' });
    const ls6 = await this.lifeStyleModel.create({ name: 'Emerging Markets' });
    const ls7 = await this.lifeStyleModel.create({ name: 'Best for Couples' });
    const ls8 = await this.lifeStyleModel.create({ name: 'Ski Resort' });

    this.addReference(LifeStyleFixture.INVESTMENT_OPPORTUNITIES, ls1);
    this.addReference(LifeStyleFixture.NEWEST_BRANDED_RESIDENCES, ls2);
    this.addReference(LifeStyleFixture.PET_FRIENDLY_RESIDENCES, ls3);
    this.addReference(LifeStyleFixture.BEACHFRONT_RESIDENCES, ls4);
    this.addReference(LifeStyleFixture.GOLF_RESIDENCES, ls5);
    this.addReference(LifeStyleFixture.EMERGING_MARKETS, ls6);
    this.addReference(LifeStyleFixture.BEST_FOR_COUPLES, ls7);
    this.addReference(LifeStyleFixture.SKI_RESORT, ls8);
  }
}
