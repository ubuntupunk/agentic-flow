import nlp from 'compromise';
import type { Contact } from '../types/contact';

export class ContactExtractor {
  private namePatterns = [
    'Best regards, #Person+',
    'Sincerely, #Person+',
    'Thanks, #Person+',
    'From: #Person+ <#Email>',
    '#Person+ | #Organization+',
  ];

  extractContacts(text: string): Contact[] {
    const doc = nlp(text);
    const contacts: Contact[] = [];
    const seen = new Set<string>();

    // Extract email signatures
    this.namePatterns.forEach(pattern => {
      const matches = doc.match(pattern);
      matches.forEach(match => {
        const person = match.people().out('array')[0];
        const org = match.organizations().out('array')[0];
        const email = match.match('#Email').out('array')[0];
        
        if (email && !seen.has(email)) {
          seen.add(email);
          contacts.push({
            id: crypto.randomUUID(),
            name: person || email.split('@')[0],
            email,
            organization: org,
            lastInteraction: new Date(),
          });
        }
      });
    });

    // Extract email addresses with names
    const emailMatches = doc.match('#Person+ <#Email>');
    emailMatches.forEach(match => {
      const person = match.people().out('array')[0];
      const email = match.match('#Email').out('array')[0];
      
      if (email && !seen.has(email)) {
        seen.add(email);
        contacts.push({
          id: crypto.randomUUID(),
          name: person,
          email,
          lastInteraction: new Date(),
        });
      }
    });

    return contacts;
  }

  async enrichContactInfo(contact: Contact): Promise<Contact> {
    try {
      // Enrich with additional information from email content
      const doc = nlp(contact.email);
      const org = contact.email.split('@')[1]?.split('.')[0];
      
      return {
        ...contact,
        organization: contact.organization || (org ? org.charAt(0).toUpperCase() + org.slice(1) : undefined),
        title: this.extractTitle(doc),
        labels: this.generateLabels(contact),
      };
    } catch (error) {
      console.error('Error enriching contact:', error);
      return contact;
    }
  }

  private extractTitle(doc: any): string | undefined {
    const titles = doc.match('(Senior|Lead|Principal|Director|Manager|Engineer|Developer|Designer|Consultant)').out('array');
    return titles[0];
  }

  private generateLabels(contact: Contact): string[] {
    const labels: string[] = [];
    
    if (contact.organization) {
      labels.push(`org:${contact.organization.toLowerCase()}`);
    }
    
    if (contact.title) {
      labels.push(`role:${contact.title.toLowerCase()}`);
    }

    const domain = contact.email.split('@')[1];
    if (domain) {
      labels.push(`domain:${domain}`);
    }

    return labels;
  }
}