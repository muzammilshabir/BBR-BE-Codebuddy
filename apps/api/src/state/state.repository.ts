import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@bbr/api-core/modules/db/base.repository';
import { State } from './schema/state.schema';
import { DeletionStatus } from 'src/unit/enum/unit-enum';

@Injectable()
export class StateRepository extends BaseRepository<State> {
  constructor(
    @InjectModel(State.name)
    private readonly stateModel: Model<State>
  ) {
    super(stateModel);
  }
  async findByStateName(name: string): Promise<State> {
    return await this.stateModel.findOne({ name });
  }

  async findByIdInDetail(stateId: string): Promise<any> {
    const state = await this.stateModel
      .findOne({ 
        _id: new Types.ObjectId(stateId), 
        isDeleted:{ $ne: DeletionStatus.DELETED }
      })
      .populate([
        { path: 'countryId', model: 'Country' },
        { path: 'createdBy', model: 'User', select: 'fullName email role' },
        { path: 'updatedBy', model: 'User', select: 'fullName email role' },
        { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
      ]);
  
    if (!state) {
      throw new NotFoundException(`State with ID ${stateId} not found`);
    }
  
    return state;
  }

}
