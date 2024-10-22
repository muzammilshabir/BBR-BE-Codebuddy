import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PushNotificationService } from './push-notification.service';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import { ServiceConfig } from 'src/config';
import { credential } from 'firebase-admin';

@Module({
  providers: [PushNotificationService, ConfigService, ServiceConfig],
  exports: [PushNotificationService],
})
export class PushNotificationModule {
  constructor(
    configService: ServiceConfig
  ) {
    const adminConfig: ServiceAccount = {
      projectId: configService.firebase.projectId,
      privateKey: configService.firebase.privateKey,
      clientEmail: configService.firebase.clientEmail,
    };
    initializeApp({
      credential: credential.cert(adminConfig),
    });
  }
}
