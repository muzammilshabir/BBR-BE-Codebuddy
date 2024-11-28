import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter } from './schema/counter.schema';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private readonly counterModel: Model<Counter>,
  ) {}

  /**
   * Increment and get the next counter value for a specific entity.
   * @param entity - The name of the entity (e.g., "Lead").
   * @returns The next counter value.
   */
  async getNextSequence(entity: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { entity },
      { $inc: { count: 1 } },
      { new: true, upsert: true }, 
    );
    return counter.count;
  }
}