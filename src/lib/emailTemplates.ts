import type { EmailTemplate } from '../types/email';

export class EmailTemplateManager {
  private templates: Map<string, EmailTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'meeting-request',
        name: 'Meeting Request',
        subject: 'Meeting Request: {{topic}}',
        body: `Dear {{recipient}},

I hope this email finds you well. I would like to schedule a meeting to discuss {{topic}}.

Proposed time: {{datetime}}

Please let me know if this works for you or suggest an alternative time.

Best regards,
{{sender}}`,
        variables: ['recipient', 'topic', 'datetime', 'sender'],
      },
      {
        id: 'follow-up',
        name: 'Follow-up',
        subject: 'Follow-up: {{topic}}',
        body: `Hi {{recipient}},

I'm following up on our discussion about {{topic}}. 

{{details}}

Looking forward to your response.

Best,
{{sender}}`,
        variables: ['recipient', 'topic', 'details', 'sender'],
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  createTemplate(template: Omit<EmailTemplate, 'id'>): EmailTemplate {
    const id = crypto.randomUUID();
    const newTemplate = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  updateTemplate(id: string, template: Partial<EmailTemplate>): boolean {
    const existing = this.templates.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...template };
    this.templates.set(id, updated);
    return true;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  applyTemplate(template: EmailTemplate, variables: Record<string, string>): string {
    let result = template.body;
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      result = result.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    return result;
  }
}