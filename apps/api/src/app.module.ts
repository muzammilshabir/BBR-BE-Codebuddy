import { BbrConfigModule } from '@bbr/api-core/modules/config/configModule';
import { BbrCoreModule } from '@bbr/api-core/modules/core.module';
import { ServiceConfig } from './config';
import { Module } from '@nestjs/common/decorators';
import { PostModule } from './posts/post.module';

@Module({
  imports: [
    BbrConfigModule.forRoot({
      useClass: ServiceConfig,
    }),
    BbrCoreModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
