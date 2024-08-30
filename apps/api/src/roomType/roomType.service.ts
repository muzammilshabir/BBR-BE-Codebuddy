import { Injectable } from '@nestjs/common';
import { RoomTypeRepository } from './roomType.repository';
import { ListRoomTypeDto } from './dto/listResidenceType.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';

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

    const { data, count } = await this.roomTypeRepository.findAll(filter, options);

    const { pagination } = PaginationService.paginate({ rows: data, count }, listRoomTypeDto);

    return { pagination, residenceType: data };
  }
}
