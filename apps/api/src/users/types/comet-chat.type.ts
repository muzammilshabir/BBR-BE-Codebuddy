export enum CometChatReceiverType {
  USER = 'user',
  GROUP = 'group',
}

export type SendMessageRequest = {
  senderId: string;
  receiverId: string;
  message: string;
  receiverType: CometChatReceiverType;
};

export enum ConversationTag {
  PINNED = 'pinned',
  ARCHIVED = 'archived',
  ACTIVE = 'active',
}
