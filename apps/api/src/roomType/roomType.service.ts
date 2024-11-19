import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from './roomType.repository';
import { ListRoomTypeDto } from './dto/listRoomType.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateRoomTypeDto } from './dto/updateRoomType.dto';
import { CreateRoomTypeDto } from './dto/createRoomType.dto';

@Injectable()
export class RoomTypeService {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async findAll(listRoomTypeDto: ListRoomTypeDto) {
    const filter = listRoomTypeDto.search
      ? {
          $or: [{ type: { $regex: listRoomTypeDto.search, $options: 'i' } }],
          isDeleted: false,
        }
      : { isDeleted: false };

    const options = PaginationService.prepareOptions(listRoomTypeDto);

    const { data, count } = await this.roomTypeRepository.findAll(filter, options, [
      { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
    ]);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listRoomTypeDto);

    return { pagination, residenceType: data };
  }

  async update(id: string, updateRoomTypeDto: UpdateRoomTypeDto) {
    const roomType = await this.roomTypeRepository.findById(id);

    if (!roomType) {
      throw new NotFoundException(`roomType with id ${id} not found`);
    }

    return await this.roomTypeRepository.update(id, updateRoomTypeDto);
  }

  async create(createRoomTypeDto: CreateRoomTypeDto) {
    return await this.roomTypeRepository.create(createRoomTypeDto);
  }

  async findById(id: string) {
    const roomType = await this.roomTypeRepository.findByIdInDetail(id);
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }
    return roomType;
  }

  async softDelete(id: string) {
    const roomType = await this.roomTypeRepository.findById(id);
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    roomType.isDeleted = true;
    return await roomType.save();
  }
}
