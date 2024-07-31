import { Injectable } from '@nestjs/common';

@Injectable()
export class SeederService {
  async runSeeder(seeders: any[]) {
    for (const seeder of seeders) {
      await seeder.seed();
    }
    // eslint-disable-next-line no-console
    console.log('after run all seeder');
  }
}