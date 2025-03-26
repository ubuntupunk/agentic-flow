import { pipeline } from '@xenova/transformers';
import type { Email, EmailCategory } from '../types/email';

export class EmailCategorizer {
  private classifier: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      this.classifier = await pipeline(
        'text-classification',
        'Xenova/bert-base-multilabel-email-categorization'
      );
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize email categorizer:', error);
      throw new Error('Failed to initialize email categorization');
    }
  }

  async categorizeEmail(email: Pick<Email, 'subject' | 'body'>): Promise<EmailCategory> {
    if (!this.initialized) {
      await this.initializeModel();
    }

    const text = `${email.subject} ${email.body}`;
    const result = await this.classifier(text);
    
    // Map model output to email categories
    const categoryMap: Record<string, EmailCategory> = {
      PERSONAL: 'primary',
      SOCIAL: 'social',
      PROMOTIONAL: 'promotions',
      UPDATE: 'updates',
      FORUM: 'forums',
    };

    return categoryMap[result[0].label] || 'primary';
  }

  async suggestLabels(email: Pick<Email, 'subject' | 'body'>): Promise<string[]> {
    const text = `${email.subject} ${email.body}`;
    const topics = await this.extractTopics(text);
    return topics.map(topic => this.normalizeLabel(topic));
  }

  private async extractTopics(text: string): Promise<string[]> {
    // Use the existing topic extraction from EmailAnalyzer
    // This is a simplified version for demonstration
    const keywords = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    return [...new Set(keywords)];
  }

  private normalizeLabel(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
}