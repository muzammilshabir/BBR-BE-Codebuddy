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
