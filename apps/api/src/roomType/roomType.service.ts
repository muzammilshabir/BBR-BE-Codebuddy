import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from './roomType.repository';
import { ListRoomTypeDto } from './dto/listRoomType.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { NotFoundException } from '@bbr/api-core/modules/exceptions';
import { UpdateRoomTypeDto } from './dto/updateRoomType.dto';

@Injectable()
export class RoomTypeService {
  constructor(private readonly roomTypeRepository: RoomTypeRepository) {}

  async findAll(listRoomTypeDto: ListRoomTypeDto) {
    const filter = listRoomTypeDto.search
      ? {
          $or: [{ type: { $regex: listRoomTypeDto.search, $options: 'i' } }],
        }
      : {};

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
}
