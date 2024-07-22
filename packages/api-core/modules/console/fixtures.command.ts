import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { FixturesService } from '../fixture/fixture.service';
import { AbstractFixture } from '../fixture/abstractFixture.service';

@Console()
@Injectable()
export class Fixtures {
  private readonly logger = new Logger(Fixtures.name);
  constructor(
    private readonly discoveryService: DiscoveryService,
    private moduleRef: ModuleRef,
    private readonly fixturesService: FixturesService
  ) {}
  @Command({
    command: 'fixtures',
    description: 'Run fixtures',
  })
  async fixtures() {
    const fixtures = [];

    for (const provider of this.discoveryService.getProviders()) {
      if (
        provider.isDependencyTreeStatic() &&
        typeof provider.name === 'string' &&
        provider?.name?.endsWith('Fixture')
      ) {
        const instance = await this.moduleRef.get(provider.token, {
          strict: false,
        });
        if (instance instanceof AbstractFixture) {
          fixtures.push(instance);
        }
      }
    }

    this.logger.log(`Importing data into DB for ${fixtures.length} Fixtures...`);
    await this.fixturesService.importFixtures(fixtures);
  }
}
