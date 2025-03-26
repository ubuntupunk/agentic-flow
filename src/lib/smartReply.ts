import { pipeline } from '@xenova/transformers';
import type { SmartReply } from '../types/email';

export class SmartReplyGenerator {
  private model: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      this.model = await pipeline(
        'text2text-generation',
        'Xenova/t5-small-email-reply'
      );
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize smart reply:', error);
      throw new Error('Failed to initialize smart reply generation');
    }
  }

  async generateReplies(email: { subject: string; body: string }): Promise<SmartReply[]> {
    if (!this.initialized) {
      await this.initializeModel();
    }

    const context = `${email.subject} ${email.body}`;
    const responses = await this.model(context, {
      max_length: 50,
      num_return_sequences: 3,
    });

    return responses.map((response: any, index: number) => ({
      text: response.generated_text,
      confidence: 1 - (index * 0.2), // Simple confidence scoring
      type: this.determineReplyType(response.generated_text),
    }));
  }

  private determineReplyType(text: string): SmartReply['type'] {
    const positiveWords = ['yes', 'sure', 'thanks', 'great', 'good'];
    const negativeWords = ['no', 'sorry', 'cannot', "can't", 'unfortunately'];

    const lowerText = text.toLowerCase();
    
    if (positiveWords.some(word => lowerText.includes(word))) {
      return 'positive';
    }
    if (negativeWords.some(word => lowerText.includes(word))) {
      return 'negative';
    }
    return 'neutral';
  }
}