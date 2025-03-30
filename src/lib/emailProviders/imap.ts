import * as IMAP from 'imap';
import { simpleParser } from 'mailparser';
import type { Email, EmailFilter, EmailData } from '../../types/email';
import { BaseEmailProvider, type EmailProviderConfig } from './base';

export class IMAPEmailProvider extends BaseEmailProvider {
  private client: IMAP;
  private messageCache: Map<string, Email>;

  constructor(config: EmailProviderConfig) {
    super(config);
    this.messageCache = new Map();
    this.client = new IMAP({
      user: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('error', (err) => {
      console.error('IMAP Error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        this.client.once('ready', resolve);
        this.client.once('error', reject);
        this.client.connect();
      });
      this.isConnected = true;
    } catch (error) {
      this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await new Promise<void>((resolve) => {
        this.client.end();
        this.client.once('end', () => {
          this.isConnected = false;
          resolve();
        });
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async listEmails(filter: EmailFilter): Promise<Email[]> {
    try {
      const box = await this.openMailbox('INBOX');
      const searchCriteria = this.buildSearchCriteria(filter);
      const messages = await this.searchMessages(searchCriteria);
      return await this.fetchMessages(messages);
    } catch (error) {
      this.handleError(error);
    }
  }

  async sendEmail(email: EmailData): Promise<void> {
    throw new Error('Send email not implemented for IMAP provider');
  }

  async createLabel(name: string): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        this.client.addBox(name, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteLabel(id: string): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        this.client.delBox(id, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async sync(): Promise<void> {
    try {
      await this.connect();
      await this.listEmails({});
    } catch (error) {
      this.handleError(error);
    }
  }

  private async openMailbox(mailbox: string): Promise<IMAP.Box> {
    return new Promise((resolve, reject) => {
      this.client.openBox(mailbox, false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  private buildSearchCriteria(filter: EmailFilter): any[] {
    const criteria: any[] = ['ALL'];
    
    if (filter.after) {
      criteria.push(['SINCE', filter.after]);
    }
    if (filter.before) {
      criteria.push(['BEFORE', filter.before]);
    }
    if (filter.from?.length) {
      criteria.push(['FROM', filter.from[0]]);
    }

    return criteria;
  }

  private async searchMessages(criteria: any[]): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.client.search(criteria, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  private async fetchMessages(ids: number[]): Promise<Email[]> {
    if (!ids.length) return [];

    return new Promise((resolve, reject) => {
      const emails: Email[] = [];
      const fetch = this.client.fetch(ids, {
        bodies: '',
        struct: true,
      });

      fetch.on('message', (msg) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            const email: Email = {
              id: parsed.messageId || crypto.randomUUID(),
              from: parsed.from?.text || '',
              to: parsed.to?.text.split(',') || [],
              subject: parsed.subject || '',
              body: parsed.text || '',
              date: parsed.date || new Date(),
              labels: [],
              priority: 'normal',
              hasAttachments: parsed.attachments.length > 0,
            };
            emails.push(email);
            this.messageCache.set(email.id, email);
          } catch (error) {
            console.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', reject);
      fetch.once('end', () => resolve(emails));
    });
  }
}