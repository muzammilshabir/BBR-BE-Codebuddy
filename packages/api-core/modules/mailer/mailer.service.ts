import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService
  ) {}

  async sendVerificationEmail(verifyToken: string, email: string) {
    const verificationLink = `${process.env.SERVICE_URL}/api/verify-email?token=${verifyToken}&email=${email}`;

    try {
      await this.mailerService.sendMail({
        from: this.configService.get<string>('MAILER_FROM'),
        to: email,
        subject: 'Verify Your Email Address',
        text: `Please click the following link to verify your email address: ${verificationLink}`,
        html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      });
      console.log('Verification email sent');
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Error sending verification email');
    }
  }

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
