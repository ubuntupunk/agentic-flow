import { google } from 'googleapis';
import type { OAuth2Config } from './oauth2';
import type { Email, EmailFilter } from '../types/email';

export class GmailAPI {
  private gmail: any;

  constructor(auth: OAuth2Config) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  private buildQuery(filters: EmailFilter): string {
    const conditions: string[] = [];

    if (filters.from?.length) {
      conditions.push(`from:(${filters.from.join(' OR ')})`);
    }
    if (filters.subject) {
      conditions.push(`subject:${filters.subject}`);
    }
    if (filters.after) {
      conditions.push(`after:${filters.after.toISOString().split('T')[0]}`);
    }
    if (filters.before) {
      conditions.push(`before:${filters.before.toISOString().split('T')[0]}`);
    }
    if (filters.labels?.length) {
      conditions.push(`label:${filters.labels.join(' label:')}`);
    }

    return conditions.join(' ');
  }

  async listEmails(filters: EmailFilter): Promise<Email[]> {
    try {
      const query = this.buildQuery(filters);
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      });

      if (!response.data.messages) {
        return [];
      }

      const emails = await Promise.all(
        response.data.messages.map(async (message: any) => {
          const email = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          const headers = email.data.payload.headers;
          const subject = headers.find((h: any) => h.name === 'Subject')?.value;
          const from = headers.find((h: any) => h.name === 'From')?.value;
          const date = headers.find((h: any) => h.name === 'Date')?.value;

          return {
            id: email.data.id,
            from,
            subject,
            body: this.getEmailBody(email.data),
            date: new Date(date),
            labels: email.data.labelIds || [],
            priority: this.getPriority(email.data.labelIds),
            hasAttachments: email.data.payload.parts?.some(
              (part: any) => part.filename
            ),
          };
        })
      );

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails. Please try again later.');
    }
  }

  private getEmailBody(message: any): string {
    const parts = message.payload.parts || [message.payload];
    const textPart = parts.find(
      (part: any) => part.mimeType === 'text/plain'
    );
    if (!textPart) return '';

    const body = textPart.body.data;
    return Buffer.from(body, 'base64').toString();
  }

  private getPriority(labels: string[]): 'high' | 'normal' | 'low' {
    if (labels.includes('IMPORTANT')) return 'high';
    if (labels.includes('CATEGORY_PERSONAL')) return 'normal';
    return 'low';
  }

  async createLabel(name: string) {
    try {
      await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
    } catch (error) {
      console.error('Error creating label:', error);
      throw new Error('Failed to create label. Please try again.');
    }
  }

  async deleteLabel(labelId: string) {
    try {
      await this.gmail.users.labels.delete({
        userId: 'me',
        id: labelId,
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      throw new Error('Failed to delete label. Please try again.');
    }
  }

  async addLabel(messageId: string, labelId: string) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId],
        },
      });
    } catch (error) {
      console.error('Error adding label:', error);
      throw new Error('Failed to add label to message. Please try again.');
    }
  }

  async getLabelId(name: string): Promise<string | null> {
    try {
      const response = await this.gmail.users.labels.list({ userId: 'me' });
      const label = response.data.labels.find((l: any) => l.name === name);
      return label ? label.id : null;
    } catch (error) {
      console.error('Error getting label ID:', error);
      throw new Error('Failed to get label information. Please try again.');
    }
  }
}