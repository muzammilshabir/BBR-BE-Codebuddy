import { Model, Document } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async findAll(
    filter: any,
    options?: any,
    populateOptions?: any[]
  ): Promise<{ data: T[]; count: number }> {
    let query = this.model.find(filter);
    if (options) {
      query.skip(options.offset).limit(options.limit).sort(options.sort);
    }

    // If populate options are provided, apply them to the query
    if (populateOptions && populateOptions.length) {
      populateOptions.forEach((populate) => {
        query = query.populate(populate);
      });
    }

    // Execute the query and count the documents
    const data = await query.exec();
    const count = await this.model.countDocuments(filter).exec();

    return { data, count };
  }

  async findOne(id: string): Promise<T> {
    return await this.model.findById(id);
  }

  async findAllByFilter(filter: any): Promise<T[]> { 
    return await this.model.find(filter);
  }

  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return await createdEntity.save();
  }

  async createMany(createDtos: any[]): Promise<T[]> {
    const createdEntities = await this.model.insertMany(createDtos);
    return createdEntities;
}

  async update(id: string, updateDto: any): Promise<T> {
    return await this.model.findByIdAndUpdate(id, updateDto, { new: true });
  }

  async updateWithFilter(filter: any, updateDto: any): Promise<T> {
    return await this.model.findOneAndUpdate(filter, updateDto, { new: true });
  }

  async updateMany(filter: any, update: any): Promise<any> {
    return this.model.updateMany(filter, update);
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

  async count(filter: any): Promise<{ count: number }> {
    const count = await this.model.countDocuments(filter).exec();
    return { count };
  }

  async findById(id: string): Promise<T> {
    return await this.model.findById(id);
  }

  async find(filter: any): Promise<T> {
    return await this.model.findOne(filter);
  }

  async findLatest(filter: any): Promise<any> {
    return await this.model.findOne(filter).sort({ createdAt: -1 });
  }
}
