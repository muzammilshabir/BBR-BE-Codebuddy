import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceFeature } from './schema/residenceFeatures.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class ResidenceFeatureFixture extends AbstractFixture {
  constructor(@InjectModel(ResidenceFeature.name) private readonly yourModel: Model<ResidenceFeature>) {
    super();
  }

  name = ResidenceFeatureFixture.name;
  static TAG_1 = 'TAG_1';
  static TAG_2 = 'TAG_2';
  static TAG_3 = 'TAG_3';

  async load(): Promise<void> {
    const residenceFeature1 = await this.yourModel.create({ name: 'Swimming Pool' });
    const residenceFeature2 = await this.yourModel.create({ name: 'Gym' });
    const residenceFeature3 = await this.yourModel.create({ name: 'Parking' });
    this.addReference(ResidenceFeatureFixture.TAG_1, residenceFeature1);
    this.addReference(ResidenceFeatureFixture.TAG_2, residenceFeature2);
    this.addReference(ResidenceFeatureFixture.TAG_3, residenceFeature3);
  }
}