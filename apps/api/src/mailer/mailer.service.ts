import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { SendEmailEvent } from './events/send-email.event';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(SendEmailEvent.event)
  async consume(event: SendEmailEvent) {
    try {
      const { subject, template, context, to } = event;
      await this.mailerService.sendMail({
        from: this.configService.get<string>('MAILER_FROM'),
        to,
        subject: subject,
        context: { ...context, subject },
        template: template,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // TODO: Remove when implementing Forgot Password flow
  async sendResetPasswordEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.SERVICE_URL}/api/reset-password?token=${resetToken}&uid=${email}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password',
        text: `Please click the following link to reset your password: ${resetLink}`,
        html: `<p>Please click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
      console.log('Reset password email sent');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new Error('Error sending reset password email');
    }
  }
}
