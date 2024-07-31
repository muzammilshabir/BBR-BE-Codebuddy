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
  static TAG_1 = 'TAG_1';

  async load(): Promise<void> {
    const residenceType1 = await this.yourModel.create({ type: 'Balcony/Terrace' });
    this.addReference(ResidenceTypeFixture.TAG_1, residenceType1);
  }
}
