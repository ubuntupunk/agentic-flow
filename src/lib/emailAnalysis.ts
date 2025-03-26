import nlp from 'compromise';
import { pipeline } from '@xenova/transformers';

export class EmailAnalyzer {
  private classifier: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      this.classifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize email analyzer:', error);
      throw new Error('Failed to initialize email analysis');
    }
  }

  async analyzeEmail(email: { subject: string; body: string }) {
    if (!this.initialized) {
      await this.initializeModels();
    }

    const text = `${email.subject} ${email.body}`;
    const doc = nlp(text);

    const analysis = {
      sentiment: await this.getSentiment(text),
      topics: this.extractTopics(doc),
      entities: this.extractEntities(doc),
      urgency: this.determineUrgency(doc),
      actionItems: this.extractActionItems(doc),
      summary: this.generateSummary(doc),
    };

    return analysis;
  }

  private async getSentiment(text: string) {
    const result = await this.classifier(text);
    return result[0].label === 'POSITIVE' ? 'positive' : 'negative';
  }

  private extractTopics(doc: any) {
    const topics = doc.topics().json();
    return topics.map((t: any) => t.text).slice(0, 5);
  }

  private extractEntities(doc: any) {
    return {
      people: doc.people().out('array'),
      organizations: doc.organizations().out('array'),
      places: doc.places().out('array'),
      dates: doc.dates().out('array'),
    };
  }

  private determineUrgency(doc: any) {
    const urgentTerms = ['urgent', 'asap', 'immediately', 'emergency', 'deadline'];
    const hasUrgentTerms = urgentTerms.some(term => 
      doc.toLowerCase().has(term)
    );
    
    const hasExclamation = doc.has('!');
    const hasTimeConstraint = doc.has('(by|before|due) #Date');

    if (hasUrgentTerms || (hasExclamation && hasTimeConstraint)) {
      return 'high';
    } else if (hasTimeConstraint) {
      return 'medium';
    }
    return 'low';
  }

  private extractActionItems(doc: any) {
    const actionVerbs = doc.match('(please|kindly) [#Verb]').out('array');
    const tasks = doc.match('[#Verb] #Preposition? (this|that|the) #Noun').out('array');
    return [...new Set([...actionVerbs, ...tasks])];
  }

  private generateSummary(doc: any) {
    const sentences = doc.sentences().out('array');
    return sentences.length > 3 
      ? sentences.slice(0, 3).join(' ') 
      : sentences.join(' ');
  }
}