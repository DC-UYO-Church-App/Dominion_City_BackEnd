import sgMail from '@sendgrid/mail';
import { config } from '../config';

sgMail.setApiKey(config.sendgrid.apiKey);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export class EmailService {
  static async send(options: EmailOptions): Promise<void> {
    try {
      const msg = {
        from: {
          email: config.sendgrid.fromEmail,
          name: config.sendgrid.fromName,
        },
        ...options,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully to:', options.to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendBulk(messages: EmailOptions[]): Promise<void> {
    try {
      const msgs = messages.map((msg) => ({
        from: {
          email: config.sendgrid.fromEmail,
          name: config.sendgrid.fromName,
        },
        ...msg,
      }));

      await sgMail.send(msgs);
      console.log(`${messages.length} emails sent successfully`);
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw error;
    }
  }
}
