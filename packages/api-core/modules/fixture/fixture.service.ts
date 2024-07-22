import { Injectable, Logger } from '@nestjs/common';
import { AbstractFixture } from './abstractFixture.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class FixturesService {
  private readonly logger = new Logger(FixturesService.name);

  constructor(@InjectConnection() private readonly dbConnection: Connection) {}

  async importFixtures(fixtures: AbstractFixture[]) {
    process.env.FIXTURE_ENV = 'true';
    const fixturesLoaded = new Map<string, boolean>();

    this.logger.debug('Clearing database');
    await this.clearDatabase();

    for (const fixture of fixtures) {
      await this.import(fixture, fixtures, fixturesLoaded);
    }
  }

  private async clearDatabase(): Promise<void> {
    // Example: Dropping the database, be cautious with this approach
    await this.dbConnection.dropDatabase();
  }

  private async import(
    f: AbstractFixture,
    allFixtures: AbstractFixture[],
    fixturesLoaded: Map<string, boolean>
  ): Promise<any> {
    if (fixturesLoaded.get(f.name)) {
      return Promise.resolve();
    }

    if (f.dependsOn && f.dependsOn.length > 0) {
      // Load all the dependencies before this fixture:
      for (let c = 0; c < f.dependsOn.length; c++) {
        const type = f.dependsOn[c];
        const fixtureDependant = allFixtures.find((fix) => fix.name === type.name);
        if (!fixtureDependant) {
          throw new Error(
            `Fixture ${f.name} depends on ${type.name} that was not included in the loadFixtures call or in the Module providers`
          );
        }

        await this.import(fixtureDependant, allFixtures, fixturesLoaded);
      }
    }

    fixturesLoaded.set(f.name, true);
    const p = await f.load();
    this.logger.debug({ name: f.name }, `Fixture ${f.name} loaded`);
    return p;
  }
}
