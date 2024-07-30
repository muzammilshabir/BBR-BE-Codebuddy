import { JwtModuleOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

export const jwtConstants = {  
  secret: process.env.JWT_SECRET_KEY,  
};

export const jwtConfig: JwtModuleOptions = {
  secret: jwtConstants.secret,
  signOptions: { expiresIn: '1h' }, // Token expiry time
};
