// src/lib/server/email/sender.ts
import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

export interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   Number(env.SMTP_PORT ?? 465),
  secure: Number(env.SMTP_PORT) === 465,
  family: 4,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
} as nodemailer.TransportOptions);

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  console.log(`[EMAIL] 📧 Sending to: ${to} | Subject: ${subject}`);
  const info = await transporter.sendMail({
    from:    env.EMAIL_FROM ?? 'Lezie <no-reply@lezie.app>',
    to,
    subject,
    html,
  });
  console.log(`[EMAIL] ✅ Delivered — messageId: ${info.messageId}`);
}
