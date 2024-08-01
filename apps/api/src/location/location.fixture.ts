import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from './schema/location.schema';
import { AbstractFixture } from '@bbr/api-core/modules/fixture/abstractFixture.service';

@Injectable()
export class LocationFixture extends AbstractFixture {
  constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) {
    super();
  }

  name = LocationFixture.name;
  static TAG_UAE = 'TAG_UAE';
  static TAG_USA = 'TAG_USA';
  static TAG_THAILAND = 'TAG_THAILAND';
  static TAG_DUBAI = 'TAG_DUBAI';
  static TAG_MIAMI = 'TAG_MIAMI';
  static TAG_NEW_YORK = 'TAG_NEW_YORK';
  static TAG_BANGKOK = 'TAG_BANGKOK';

  async load(): Promise<void> {
    const uae = await this.locationModel.create({ type: 'country', name: 'UAE' });
    const usa = await this.locationModel.create({ type: 'country', name: 'USA' });
    const thailand = await this.locationModel.create({ type: 'country', name: 'Thailand' });
    
    const dubai = await this.locationModel.create({ type: 'city', name: 'Dubai', parentId: uae._id });
    const miami = await this.locationModel.create({ type: 'city', name: 'Miami', parentId: usa._id });
    const newYork = await this.locationModel.create({ type: 'city', name: 'New York', parentId: usa._id });
    const bangkok = await this.locationModel.create({ type: 'city', name: 'Bangkok', parentId: thailand._id });

    this.addReference(LocationFixture.TAG_UAE, uae);
    this.addReference(LocationFixture.TAG_USA, usa);
    this.addReference(LocationFixture.TAG_THAILAND, thailand);
    this.addReference(LocationFixture.TAG_DUBAI, dubai);
    this.addReference(LocationFixture.TAG_MIAMI, miami);
    this.addReference(LocationFixture.TAG_NEW_YORK, newYork);
    this.addReference(LocationFixture.TAG_BANGKOK, bangkok);
  }
}