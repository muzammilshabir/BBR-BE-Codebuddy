import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { SeederService } from '../seeder/seeder.service';
import { AbstractSeeder } from '../seeder/abstractSeeder.service';
import * as inquirer from 'inquirer';

@Console()
@Injectable()
export class Seeders {
  private readonly logger = new Logger(Seeders.name);
  constructor(
    private readonly discoveryService: DiscoveryService,
    private moduleRef: ModuleRef,
    private readonly seederService: SeederService
  ) {}
  @Command({
    command: 'seeders',
    description: 'Run seeders',
  })
  async seeders() {
    const seeders = [];

    for (const provider of this.discoveryService.getProviders()) {
      if (
        provider.isDependencyTreeStatic() &&
        typeof provider.name === 'string' &&
        provider?.name?.endsWith('Seeder')
      ) {
        // eslint-disable-next-line no-console
        console.log('provider.name :>> ', provider.name);
        const instance = await this.moduleRef.get(provider.token, {
          strict: false,
        });
        if (instance instanceof AbstractSeeder) {
          seeders.push(instance);
        }
      }
    }

    this.promptSeeder(seeders);
  }

  async promptSeeder(seeders: any) {
    inquirer
      .prompt([
        {
          type: 'checkbox',
          name: 'List of Seeders',
          message: 'Which seeder do you want to run?',
          choices: seeders.map((s) => s.name).concat('All'),
        },
      ])
      .then(async (answers: any) => {
        if (answers['List of Seeders'].includes('All')) {
          return await this.seederService.runSeeder(seeders);
        }
        const specificSeeder = seeders.filter((s) => answers['List of Seeders'].includes(s.name));
        await this.seederService.runSeeder(specificSeeder);
      })
      .catch((error) => {
        this.logger.log(error);
      });
  }
}
