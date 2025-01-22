import { Injectable } from '@nestjs/common';
import { CometChatService } from 'src/users/comet-chat.service';
import { ConversationTag } from 'src/users/types/comet-chat.type';
import { ToggleConversationDto } from './dto/toggle-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly cometChatService: CometChatService) {}

  async togglePinConversation(dto: ToggleConversationDto) {
    const conversation = await this.cometChatService.getConversation(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId
    );

    let { tags } = conversation.data;
    if (!tags) {
      tags = [];
    }

    if (tags.includes(ConversationTag.PINNED)) {
      //   remove pinned tag
      tags = tags.filter((tag) => tag !== ConversationTag.PINNED);
    } else {
      //   add pinned tag
      tags.push(ConversationTag.PINNED);
    }

    await this.cometChatService.updateConversationTags(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId,
      tags
    );

    const updatedConversation = await this.cometChatService.getConversation(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId
    );

    return updatedConversation.data.tags;
  }

  async toggleArchiveConversation(dto: ToggleConversationDto) {
    const conversation = await this.cometChatService.getConversation(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId
    );

    let { tags } = conversation.data;
    if (!tags) {
      tags = [];
    }

    if (tags.includes(ConversationTag.ARCHIVED)) {
      //   remove archived tag
      tags = tags.filter((tag) => tag !== ConversationTag.ARCHIVED);
      // add active tag
      tags.push(ConversationTag.ACTIVE);
    } else {
      //   add archived tag
      tags.push(ConversationTag.ARCHIVED);
      // remove active tag
      tags = tags.filter((tag) => ![ConversationTag.ACTIVE, ConversationTag.PINNED].includes(tag));
    }

    await this.cometChatService.updateConversationTags(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId,
      tags
    );

    const updatedConversation = await this.cometChatService.getConversation(
      dto.type,
      dto.id,
      dto.onBehalfOfUserId
    );

    return updatedConversation.data.tags;
  }
}
