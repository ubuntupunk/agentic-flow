import { pipeline } from '@xenova/transformers';
import VectorStorage from 'vector-storage';

export class EmailVectorSearch {
  private embedder: any;
  private vectorStore: VectorStorage;

  constructor() {
    this.vectorStore = new VectorStorage();
    this.initializeEmbedder();
  }

  private async initializeEmbedder() {
    try {
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (error) {
      console.error('Failed to initialize embedder:', error);
      throw new Error('Failed to initialize search functionality');
    }
  }

  async addEmail(email: { id: string; subject: string; body: string }) {
    try {
      const text = `${email.subject} ${email.body}`;
      const embedding = await this.embedder(text, { pooling: 'mean', normalize: true });
      await this.vectorStore.add(email.id, embedding.data);
    } catch (error) {
      console.error('Failed to add email to vector store:', error);
      throw new Error('Failed to process email for search');
    }
  }

  async searchSimilar(query: string, limit = 5): Promise<string[]> {
    try {
      const queryEmbedding = await this.embedder(query, { pooling: 'mean', normalize: true });
      const results = await this.vectorStore.search(queryEmbedding.data, limit);
      return results.map(result => result.id);
    } catch (error) {
      console.error('Failed to search emails:', error);
      throw new Error('Failed to search emails');
    }
  }

  async clear() {
    await this.vectorStore.clear();
  }
}