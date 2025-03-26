import type { Contact } from './contact';

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  date: Date;
  labels: string[];
  priority: 'high' | 'normal' | 'low';
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  threadId?: string;
  category?: EmailCategory;
  scheduledDate?: Date;
  contacts?: Contact[];
  events?: CalendarEvent[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
}

export interface EmailFilter {
  from?: string[];
  subject?: string;
  after?: Date;
  before?: Date;
  labels?: string[];
  priority?: 'high' | 'normal' | 'low';
  category?: EmailCategory;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees: string[];
}

export type EmailCategory =
  | 'primary'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'forums';

export interface ThreadAnalysis {
  participants: string[];
  duration: number;
  messageCount: number;
  sentiment: string;
  topics: string[];
  timeline: ThreadEvent[];
}

export interface ThreadEvent {
  date: Date;
  type: 'message' | 'attachment' | 'label' | 'participant';
  description: string;
}

export interface SmartReply {
  text: string;
  confidence: number;
  type: 'positive' | 'negative' | 'neutral';
}