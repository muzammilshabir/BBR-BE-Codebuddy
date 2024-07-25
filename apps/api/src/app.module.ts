import { BbrConfigModule } from '@bbr/api-core/modules/config/configModule';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceConfig } from './config';
import { Module } from '@nestjs/common/decorators';
import { PostModule } from './posts/post.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    BbrConfigModule.forRoot({
      useClass: ServiceConfig,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    PostModule,
    UserModule,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
