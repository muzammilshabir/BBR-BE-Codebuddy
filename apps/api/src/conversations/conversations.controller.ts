import { Controller, Post, Body, UsePipes, Query, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ConversationsService } from './conversations.service';
import { ToggleConversationDto } from './dto/toggle-conversation.dto';
import { toggleConversationDtoSchema } from './dto/toggle-conversation.dto';
import { listConversationMessagesDtoSchema } from './dto/list-conversation-messages.dto';
import { ListConversationMessagesDto } from './dto/list-conversation-messages.dto';
import { SendMessageDto, sendMessageDtoSchema } from './dto/send-message.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('toggle-pin')
  @ApiOperation({ summary: 'Toggle pin status of a conversation' })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(toggleConversationDtoSchema, 'body'))
  async togglePinConversation(@Body() dto: ToggleConversationDto) {
    const result = await this.conversationsService.togglePinConversation(dto);
    return ResponseService.buildResponse({ result }, 'Successfully toggled pin status');
  }

  @Post('toggle-archive')
  @ApiOperation({ summary: 'Toggle archive status of a conversation' })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(toggleConversationDtoSchema, 'body'))
  async toggleArchiveConversation(@Body() dto: ToggleConversationDto) {
    const result = await this.conversationsService.toggleArchiveConversation(dto);
    return ResponseService.buildResponse({ result }, 'Successfully toggled archive status');
  }

  @Get('list-messages')
  @ApiOperation({ summary: 'List messages of a conversation' })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(listConversationMessagesDtoSchema, 'query'))
  async listConversationMessages(@Query() dto: ListConversationMessagesDto) {
    const result = await this.conversationsService.listConversationMessages(dto);
    return ResponseService.buildResponse({ result }, 'Successfully listed messages');
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Send message to a conversation' })
  @ApiBearerAuth()
  @UsePipes(new JoiValidationPipe(sendMessageDtoSchema, 'body'))
  async sendMessage(@Body() dto: SendMessageDto) {
    await this.conversationsService.sendMessage(dto);
    return ResponseService.buildResponse({}, 'Successfully sent message');
  }
}
