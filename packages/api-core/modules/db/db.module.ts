import { Module } from '@nestjs/common';
import { BbrDbConfigModule } from './bbrDbConfig.module';
import { DbConfig } from './config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    BbrDbConfigModule,
    SequelizeModule.forRootAsync({
      imports: [BbrDbConfigModule],
      inject: [DbConfig],
      useFactory: (dbConfig: DbConfig) => ({
        dialect: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
  ],
  exports: [SequelizeModule, BbrDbConfigModule],
})
export class BbrDbModule {}
