import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Newsroom, NewsroomSchema } from './schema/newsroom.schema';
import { NewsroomService } from './newsroom.service';
import { NewsroomController } from './newsroom.controller';
import { NewsroomRepository } from './newsroom.repository';
import { NewsroomSeeder } from './newsroom.seeder';
import { NewsroomFixture } from './newsroom.fixture';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/users/user.module';
import { ResidenceModule } from 'src/residences/residences.module';
import { NewsroomCategory, NewsroomCategorySchema } from './schema/newsroom-category.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Newsroom.name, schema: NewsroomSchema }]),
    MongooseModule.forFeature([{ name: NewsroomCategory.name, schema: NewsroomCategorySchema }]),
  ],
  providers: [NewsroomService, NewsroomRepository, NewsroomSeeder, NewsroomFixture],
  exports: [NewsroomSeeder, NewsroomFixture],
  controllers: [NewsroomController],
})
export class NewsroomModule {}