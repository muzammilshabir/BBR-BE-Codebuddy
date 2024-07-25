import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });



// Create a transporter for sending emails

const transporter = nodemailer.createTransport({
  host: process.env.NODMAILER_HOST,
  port: process.env.NODMAILER_PORT,
  auth: {
      user: process.env.NODMAILER_USER,
      pass: process.env.NODMAILER_PASS
  }

});

export async function sendVerificationEmail(uid: any, verifyToken: string, email: string) {
  const verificationLink = `${process.env.SERVICE_URL}/api/verify-email?token=${verifyToken}&uid=${uid}`;

  // Define email options
  const mailOptions = {
    from: process.env.NODMAILER_USER, // Sender address
    to: email, // Recipient address
    subject: 'Verify Your Email Address',
    text: `Please click the following link to verify your email address: ${verificationLink}`,
    html: `<p>Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending verification email');
  }
}


export async function sendResetPasswordEmail(uid: string, email: string, resetToken: string) {
  const resetLink = `${process.env.SERVICE_URL}/api/reset-password?token=${resetToken}&uid=${uid}`;
  const emailContent = {
    from: process.env.NODMAILER_USER, // Sender address
    to: email,
    subject: 'Reset Your Password',
    text: `Please click the following link to reset your password: ${resetLink}`,
    html: `<p>Please click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  };

  try {
    await transporter.sendMail(emailContent);
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Error sending reset password email');
  }
}
