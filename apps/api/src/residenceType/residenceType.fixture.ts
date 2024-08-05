import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResidenceType } from './schema/residenceType.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class ResidenceTypeFixture extends AbstractFixture {
  constructor(@InjectModel(ResidenceType.name) private readonly yourModel: Model<ResidenceType>) {
    super();
  }

  name = ResidenceTypeFixture.name;
  static RESIDENCE_TYPE_1 = 'RESIDENCE_TYPE_1';
  static RESIDENCE_TYPE_2 = 'RESIDENCE_TYPE_2';
  static RESIDENCE_TYPE_3 = 'RESIDENCE_TYPE_3';

  async load(): Promise<void> {
    const residenceType1 = await this.yourModel.create({ type: 'Balcony/Terrace' });
    const residenceType2 = await this.yourModel.create({ type: 'Garden' });
    const residenceType3 = await this.yourModel.create({ type: 'Rooftop' });
    this.addReference(ResidenceTypeFixture.RESIDENCE_TYPE_1, residenceType1);
    this.addReference(ResidenceTypeFixture.RESIDENCE_TYPE_2, residenceType2);
    this.addReference(ResidenceTypeFixture.RESIDENCE_TYPE_3, residenceType3);
  }
}
