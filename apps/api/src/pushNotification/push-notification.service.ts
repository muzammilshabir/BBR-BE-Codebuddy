import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PushNotificationMessage } from './interfaces/message';

@Injectable()
export class PushNotificationService {

  async sendMessage(token: string, message: PushNotificationMessage) {
    return admin.messaging().send({
      token,
      notification: {
        title: message.title,
        body: message.body,
      },
    });
  }

  async sendGroupMessage(topic: string, message: PushNotificationMessage) {
    return admin.messaging().send({
      topic,
      notification: {
        title: message.title,
        body: message.body,
      },
    });
  }

  /**
   * Add user devices to a FCM Topic. Creates topic if it doesn't already exists.
   * @param token 
   * @param topic 
   * @returns 
   */
  async addUserToGroup(token: string | string[], topic: string) {
    return admin.messaging().subscribeToTopic(token, topic);
  }

  async removeUserFromGroup(token: string | string[], topic: string) {
    return admin.messaging().unsubscribeFromTopic(token, topic);
  }
}
