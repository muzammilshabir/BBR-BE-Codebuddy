import { Injectable } from '@nestjs/common';
import { CometChatService } from 'src/users/comet-chat.service';
import {
  CometChatReceiverType,
  ConversationTag,
  ListConversationMessagesDirectionCometChat,
} from 'src/users/types/comet-chat.type';
import { ToggleConversationDto } from './dto/toggle-conversation.dto';
import {
  ListConversationMessagesDirection,
  ListConversationMessagesDto,
} from './dto/list-conversation-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ToggleGroupDto } from './dto/toggle-group.dto';

@Injectable()
export class ConversationsService {
  async listConversationMessages(dto: ListConversationMessagesDto) {
    const { conversationId, types, cursor, direction, limit, category } = dto;

    const resp = await this.cometChatService.listConversationMessages(
      conversationId,
      types,
      cursor,
      direction,
      limit,
      category
    );

    const messages = resp.data.map((message) => ({
      id: message.id,
      attachments: message.data.attachments,
      category: message.category,
      type: message.type,
    }));

    const meta = {
      ...(resp.meta.previous && {
        previous: {
          direction:
            resp.meta.previous.affix === ListConversationMessagesDirectionCometChat.BEFORE
              ? ListConversationMessagesDirection.BEFORE
              : ListConversationMessagesDirection.AFTER,
          id: resp.meta.previous.id,
        },
      }),
      current: {
        limit: resp.meta.current.limit,
        count: resp.meta.current.count,
      },
      ...(resp.meta.next && {
        next: {
          direction:
            resp.meta.next.affix === ListConversationMessagesDirectionCometChat.BEFORE
              ? ListConversationMessagesDirection.BEFORE
              : ListConversationMessagesDirection.AFTER,
          id: resp.meta.next.id,
        },
      }),
    };

    return { messages, meta };
  }
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

  async sendMessage(dto: SendMessageDto) {
    const { senderId, receiverId, receiverType, messageText } = dto;

    await this.cometChatService.sendMessage({
      senderId,
      receiverId,
      receiverType: receiverType as CometChatReceiverType,
      message: messageText,
    });
  }

  async togglePinGroupConversation(dto: ToggleGroupDto) {
    const { guid, onBehalfOfUserId } = dto;

    const group = await this.cometChatService.getGroup(guid);

    let { tags } = group.data;
    if (!tags) {
      tags = [];
    }

    // const activeTag = `${onBehalfOfUserId}-${ConversationTag.ACTIVE}`;
    const pinnedTag = `${onBehalfOfUserId}-${ConversationTag.PINNED}`;
    // const archivedTag = `${onBehalfOfUserId}-${ConversationTag.ARCHIVED}`;

    if (tags.includes(pinnedTag)) {
      //   remove pinned tag
      tags = tags.filter((tag) => tag !== pinnedTag);
    } else {
      //   add pinned tag
      tags.push(pinnedTag);
    }

    await this.cometChatService.updateGroupTags(guid, tags);
  }

  async toggleArchiveGroupConversation(dto: ToggleGroupDto) {
    const { guid, onBehalfOfUserId } = dto;

    const group = await this.cometChatService.getGroup(guid);

    let { tags } = group.data;
    if (!tags) {
      tags = [];
    }

    const activeTag = `${onBehalfOfUserId}-${ConversationTag.ACTIVE}`;
    const archivedTag = `${onBehalfOfUserId}-${ConversationTag.ARCHIVED}`;
    const pinnedTag = `${onBehalfOfUserId}-${ConversationTag.PINNED}`;

    if (tags.includes(archivedTag)) {
      //   remove archived tag
      tags = tags.filter((tag) => tag !== archivedTag);
      // add active tag
      tags.push(activeTag);
    } else {
      //   add archived tag
      tags.push(archivedTag);
      // remove active tag
      tags = tags.filter((tag) => ![activeTag, pinnedTag].includes(tag));
    }

    await this.cometChatService.updateGroupTags(guid, tags);
  }
}
