import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'jeev_backend_user',
  password: 'jeev_backend_password',
  database: 'jeev_backend',
  autoLoadModels: true,
  synchronize: false, // Turn off synchronize to use migrations
};