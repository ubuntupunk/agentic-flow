import Fuse from 'fuse.js';
import type { Email } from '../types/email';
import { EmailVectorSearch } from './vectorSearch';

export class SearchEngine {
  private fuseInstance: Fuse<Email>;
  private vectorSearch: EmailVectorSearch;

  constructor() {
    this.fuseInstance = new Fuse([], {
      keys: ['subject', 'body', 'from'],
      threshold: 0.3,
      includeScore: true,
    });
    this.vectorSearch = new EmailVectorSearch();
  }

  updateEmails(emails: Email[]) {
    this.fuseInstance.setCollection(emails);
  }

  async addToVectorStore(email: Email) {
    await this.vectorSearch.addEmail({
      id: email.id,
      subject: email.subject,
      body: email.body,
    });
  }

  fuzzySearch(query: string): Email[] {
    const results = this.fuseInstance.search(query);
    return results.map(result => result.item);
  }

  async semanticSearch(query: string, limit = 5): Promise<Email[]> {
    const emailIds = await this.vectorSearch.searchSimilar(query, limit);
    const emails = this.fuseInstance.getIndex().docs;
    return emailIds
      .map(id => emails.find(email => email.id === id))
      .filter((email): email is Email => email !== undefined);
  }

  async combinedSearch(query: string): Promise<Email[]> {
    const [fuzzyResults, semanticResults] = await Promise.all([
      this.fuzzySearch(query),
      this.semanticSearch(query),
    ]);

    const uniqueEmails = new Map<string, Email>();
    [...fuzzyResults, ...semanticResults].forEach(email => {
      uniqueEmails.set(email.id, email);
    });

    return Array.from(uniqueEmails.values());
  }
}