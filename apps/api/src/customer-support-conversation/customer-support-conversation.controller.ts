import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerSupportConversationService } from './customer-support-conversation.service';
import { CreateConversationDto, createConversationSchema } from './dto/create-conversation.dto';
import { JoiValidationPipe } from '@bbr/api-core/modules/joi-validation-pipe/joi-validation-pipe.interceptor';
import { GetCurrentUser } from '../auth/decorators/getCurrentUser.decorator';
import { JwtPayloadType } from '../auth/type/jwt-payload.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enum/user.enum';
import { ResponseService } from '@bbr/api-core/modules/response/response.service';
import { ListConversationDto } from './dto/list-conversation.dto';
import { listConversationSchema } from './dto/list-conversation.dto';

@ApiTags('CustomerSupportConversation')
@Controller('customer-support-conversation')
export class CustomerSupportConversationController {
  constructor(private readonly conversationService: CustomerSupportConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create conversation reply' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(createConversationSchema, 'body'))
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @GetCurrentUser() user: JwtPayloadType
  ) {
    const conversation = await this.conversationService.create(createConversationDto, user.sub);
    return ResponseService.buildResponse({ conversation }, 'Conversation created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get conversations for a customer support ticket' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SELLER)
  @UsePipes(new JoiValidationPipe(listConversationSchema, 'query'))
  async getConversations(@Query() listConversationDto: ListConversationDto) {
    const conversations = await this.conversationService.getConversations(listConversationDto);
    return ResponseService.buildResponse(conversations, 'Conversations retrieved successfully');
  }
}
