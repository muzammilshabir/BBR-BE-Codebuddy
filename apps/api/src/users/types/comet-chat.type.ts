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

export enum ListConversationMessagesDirectionCometChat {
  BEFORE = 'prepend',
  AFTER = 'append',
}

export type CometChatMember = {
  admins?: string[];
  moderators?: string[];
  participants?: string[];
  usersToBan?: string[];
};

export type CometChatCreateGroup = {
  guid: string;
  name: string;
  type: string;
  members: CometChatMember;
  avatar?: string;
};
