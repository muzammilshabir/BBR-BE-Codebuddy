import { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async findAll(filter: any, options?: any): Promise<{ data: T[]; count: number }> {
    const query =  this.model
      .find(filter);
    if(options) {
      query
      .skip(options.offset)
      .limit(options.limit)
      .sort(options.sort)
    }
    const data = await query;
    const count = await this.model.countDocuments(filter).exec();
    return { data, count };
  }

  async findOne(id: string): Promise<T> {
    return await this.model.findById(id);
  }

  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return await createdEntity.save();
  }

  async update(id: string, updateDto: any): Promise<T> {
    return await this.model.findByIdAndUpdate(id, updateDto, { new: true });
  }

  async updateWithFilter(filter: any, updateDto: any): Promise<T> {
    return await this.model.findOneAndUpdate(filter, updateDto, { new: true });
  }

  async delete(id: string): Promise<T> {
    return await this.model.findByIdAndDelete(id);
  }

  async upsert(filter: any, updateDto: any): Promise<T> {
    return this.model
      .findOneAndUpdate(filter, updateDto, {
        new: true, // Return the updated document
        upsert: true, // Create if not exists
        runValidators: true, // Validate update
      })
      .exec();
  }
}
