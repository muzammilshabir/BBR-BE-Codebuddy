import { Body, Controller, Post, Get, Patch, Param, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuickRepliesService } from './quick-replies.service';
import { CreateQuickReplyDto, createQuickReplySchema } from './dto/create-quick-reply.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { GetCurrentUserId } from '../auth/decorators/getCurrentUserId.decorator';

@ApiTags('Quick Replies')
@Controller('quick-replies')
export class QuickRepliesController {
  constructor(private readonly quickRepliesService: QuickRepliesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new QuickReply',
  })
  @UsePipes(new JoiValidationPipe(createQuickReplySchema, 'body'))
  async create(
    @Body() createQuickReplyDto: CreateQuickReplyDto,
    @GetCurrentUserId() userId: string,
  ) {
    const quickReply = await this.quickRepliesService.create({
      userId,
      message: createQuickReplyDto.message,
    });

    return ResponseService.buildResponse({quickReply}, 'Quick Reply created successfully');
  }
  

  @Get()
  @ApiOperation({
    summary: 'List of quick replies',
  })
  async listReplies(@GetCurrentUserId() userId: string) {
    const quickReplies = await this.quickRepliesService.findByUserId(userId);


    return ResponseService.buildResponse({quickReplies}, 'Quick replies list retrieved successfully');
  }


  @Patch(':id')
  @ApiOperation({
    summary: 'Edit an existing QuickReply',
  })
  async edit(
    @Param('id') id: string,
    @Body('message') message: string,
    @GetCurrentUserId() userId: string,
  ) {
    const quickReply = await this.quickRepliesService.edit({ id, userId, message });


    return ResponseService.buildResponse({quickReply}, 'Quick Reply updated successfully');
  }

}
