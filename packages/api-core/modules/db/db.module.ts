import { Module } from '@nestjs/common';
import { BbrDbConfigModule } from './bbrDbConfig.module';
import { DbConfig } from './config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    BbrDbConfigModule,
    MongooseModule.forRootAsync({
      imports: [BbrDbConfigModule],
      inject: [DbConfig],
      useFactory: (dbConfig: DbConfig) => ({
        uri: dbConfig.mongodbUri,
      }),
    }),
  ],
  exports: [MongooseModule, BbrDbConfigModule],
})
export class BbrDbModule {}
