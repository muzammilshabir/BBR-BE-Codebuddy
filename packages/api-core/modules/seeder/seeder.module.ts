import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { SeederService } from './seeder.service';
import { Seeders } from '../console/seeders.command';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [Seeders, SeederService],
  exports: [Seeders, SeederService],
})
export class SeederModule {}