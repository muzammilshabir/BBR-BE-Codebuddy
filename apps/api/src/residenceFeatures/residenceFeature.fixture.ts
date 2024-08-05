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
  static RESIDENCE_FEATURE_1 = 'Swimming Pool';
  static RESIDENCE_FEATURE_2 = 'Gym';
  static RESIDENCE_FEATURE_3 = 'Parking';

  async load(): Promise<any> {
    const residenceFeature1 = await this.yourModel.create({ name: 'Swimming Pool' });
    const residenceFeature2 = await this.yourModel.create({ name: 'Gym' });
    const residenceFeature3 = await this.yourModel.create({ name: 'Parking' });
    this.addReference(ResidenceFeatureFixture.RESIDENCE_FEATURE_1, residenceFeature1);
    this.addReference(ResidenceFeatureFixture.RESIDENCE_FEATURE_2, residenceFeature2);
    this.addReference(ResidenceFeatureFixture.RESIDENCE_FEATURE_3, residenceFeature3);

    return await this.yourModel.find()
  }
}
