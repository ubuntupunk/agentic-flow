import { google } from 'googleapis';
import type { Email } from '../types/email';

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

interface LabelSyncConfig {
  include: string[];
  exclude: string[];
}

export class EmailService {
  private gmail: any;

  constructor(auth: any) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async sendEmail({ to, subject, body }: SendEmailParams) {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async syncLabels(config: LabelSyncConfig) {
    try {
      const response = await this.gmail.users.labels.list({ userId: 'me' });
      const labels = response.data.labels || [];
      
      return labels
        .filter((label: any) => {
          const name = label.name.toLowerCase();
          const included = !config.include.length || config.include.some(i => 
            name.includes(i.toLowerCase())
          );
          const excluded = config.exclude.some(e => 
            name.includes(e.toLowerCase())
          );
          return included && !excluded;
        })
        .map((label: any) => label.name);
    } catch (error) {
      console.error('Error syncing labels:', error);
      throw error;
    }
  }
}