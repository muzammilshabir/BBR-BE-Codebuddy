import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
@Injectable()
export class SeederService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async runSeeder(seeders: any[]) {
    if (this.connection.readyState !== 1) {
      await this.connection.openUri(process.env.DB_URI); // Use the appropriate URI for your environment
    }
    for (const seeder of seeders) {
      await seeder.seed();
    }
    // eslint-disable-next-line no-console
    console.log('after run all seeder');
    process.exit(0);
  }
}
