import { Injectable, NotFoundException } from '@nestjs/common';
import { StateRepository } from './state.repository';
import { ListStateDto } from './dto/listState.dto';
import { PaginationService } from '@bbr/api-core/modules/pagination/pagination.service';
import { UpdateStateDto } from './dto/updateState.dto';

@Injectable()
export class StateService {

    constructor(private readonly stateRepository: StateRepository) {}

    async findAll(listStateDto: ListStateDto) {
        const filter = listStateDto.search
          ? {
              $or: [{ name: { $regex: listStateDto.search, $options: 'i' } }],
            }
          : {};
    
        const options = PaginationService.prepareOptions(listStateDto);
    
        const { data, count } = await this.stateRepository.findAll(filter, options, [
          { path: 'upload.ImageId', select: 'originalFileKey fileKey url mimeType', model: 'Upload' },
        ]);
    
        const { pagination } = PaginationService.paginate({ rows: data, count }, listStateDto);
    
        return { pagination, countries: data };
    }

      async update(id: string, updateStateDto: UpdateStateDto) {
        const state = await this.stateRepository.findById(id);
    
        if (!state) {
          throw new NotFoundException(`State with id ${id} not found`);
        }
    
        return await this.stateRepository.update(id, updateStateDto);
      }
    
      async getStateById(stateId: string): Promise<any> {
        return await this.stateRepository.findByIdInDetail(stateId);
      }

}
