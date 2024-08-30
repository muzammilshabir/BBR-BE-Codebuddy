import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Newsroom, NewsroomSchema } from './schema/newsroom.schema';
import { NewsroomService } from './newsroom.service';
import { NewsroomController } from './newsroom.controller';
import { NewsroomRepository } from './newsroom.repository';
import { MailerCoreModule } from 'src/mailer/mailer.module';
import { UserModule } from 'src/users/user.module';
import { ResidenceModule } from 'src/residences/residences.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerCoreModule,
    UserModule,
    ResidenceModule,
    MongooseModule.forFeature([{ name: Newsroom.name, schema: NewsroomSchema }]),
  ],
  providers: [NewsroomService, NewsroomRepository],
  exports: [],
  controllers: [NewsroomController],
})
export class NewsroomModule {}
