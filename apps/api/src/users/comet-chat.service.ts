import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  CometChatReceiverType,
  ConversationTag,
  SendMessageRequest,
} from './types/comet-chat.type';

@Injectable()
export class CometChatService {
  private readonly apiKey: string;
  private readonly appId: string;
  private readonly region: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('COMET_CHAT_API_KEY');
    this.appId = this.configService.get<string>('COMET_CHAT_APP_ID');
    this.region = this.configService.get<string>('COMET_CHAT_REGION');
    this.baseUrl = `https://${this.appId}.api-${this.region}.cometchat.io/v3`;
  }

  async createUser(userId: string, name: string, role: string, avatarUrl?: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users`,
        {
          uid: userId,
          name,
          avatar: avatarUrl,
          role,
        },
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CometChat user creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateUser(userId: string, updates: { name?: string; avatarUrl?: string }) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/users/${userId}`,
        {
          name: updates.name,
          avatar: updates.avatarUrl,
        },
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CometChat user update failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async createGroup(groupData: {
    guid: string;
    name: string;
    type: CometChatReceiverType;
    avatar?: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/groups`, groupData, {
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('CometChat group creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async addMembersToGroup(groupId: string, participants: string[]) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/groups/${groupId}/members`,
        { participants },
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CometChat add members failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateGroup(
    groupId: string,
    updateData: {
      name?: string;
      avatar?: string;
      metadata?: any;
    }
  ) {
    try {
      const response = await axios.put(`${this.baseUrl}/groups/${groupId}`, updateData, {
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('CometChat group update failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(message: SendMessageRequest) {
    try {
      console.log(`${this.baseUrl}/messages`);

      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          category: 'message',
          type: 'text',
          data: {
            text: message.message,
          },
          receiver: message.receiverId,
          receiverType: message.receiverType,
        },
        {
          headers: {
            apiKey: this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            onBehalfOf: message.senderId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('CometChat group update failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversation(type: CometChatReceiverType, id: string, onBehalfOfUserId: string) {
    const url =
      type === CometChatReceiverType.USER
        ? `${this.baseUrl}/users/${id}/conversation`
        : `${this.baseUrl}/groups/${id}/conversation`;

    const response = await axios.get(url, {
      headers: {
        apiKey: this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        onBehalfOf: onBehalfOfUserId,
      },
    });
    return response.data;
  }

  async updateConversationTags(
    type: CometChatReceiverType,
    id: string,
    onBehalfOfUserId: string,
    tags: ConversationTag[]
  ) {
    const url =
      type === CometChatReceiverType.USER
        ? `${this.baseUrl}/users/${id}/conversation`
        : `${this.baseUrl}/groups/${id}/conversation`;

    await axios.put(
      url,
      { tags },
      {
        headers: {
          apiKey: this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          onBehalfOf: onBehalfOfUserId,
        },
      }
    );
  }
}
