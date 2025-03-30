import type { Email, EmailFilter, EmailData } from '../../types/email';

export interface EmailProviderConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  tls: boolean;
}

export abstract class BaseEmailProvider {
  protected config: EmailProviderConfig;
  protected isConnected: boolean = false;

  constructor(config: EmailProviderConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract listEmails(filter: EmailFilter): Promise<Email[]>;
  abstract sendEmail(email: EmailData): Promise<void>;
  abstract createLabel(name: string): Promise<void>;
  abstract deleteLabel(id: string): Promise<void>;
  abstract sync(): Promise<void>;

  isAuthenticated(): boolean {
    return this.isConnected;
  }

  protected validateConfig(): void {
    if (!this.config.host || !this.config.port || !this.config.username || !this.config.password) {
      throw new Error('Invalid email provider configuration');
    }
  }

  protected handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Email provider error: ${message}`);
  }
}