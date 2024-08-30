import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomType, RoomTypeSchema } from './schema/roomType.schema';
import { RoomTypeService } from './roomType.service';
import { RoomTypeController } from './roomType.controller';
import { RoomTypeRepository } from './roomType.repository';
import { RoomTypeSeeder } from './roomType.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: RoomType.name, schema: RoomTypeSchema }])],
  providers: [RoomTypeService, RoomTypeRepository, RoomTypeSeeder],
  exports: [RoomTypeSeeder],
  controllers: [RoomTypeController],
})
export class RoomTypeModule {}
