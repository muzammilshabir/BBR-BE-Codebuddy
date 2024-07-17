import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const sequelizeConfig: SequelizeModuleOptions = {
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'bbr_backend_user',
  password: 'bbr_backend_password',
  database: 'bbr_backend',
  autoLoadModels: true,
  synchronize: false, // Turn off synchronize to use migrations
};
