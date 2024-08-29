import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsroomService } from './newsroom.service';

@ApiTags('Newsroom')
@Controller('newsroom')
export class NewsroomController {
  constructor(private readonly newsroomService: NewsroomService) {}

}
