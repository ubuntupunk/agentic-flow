import { format } from 'date-fns';
import type { Email, ThreadAnalysis, ThreadEvent } from '../types/email';

export class ThreadAnalyzer {
  async analyzeThread(emails: Email[]): Promise<ThreadAnalysis> {
    // Sort emails by date
    const sortedEmails = [...emails].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Extract unique participants
    const participants = new Set<string>();
    emails.forEach(email => {
      participants.add(email.from);
      email.to.forEach(to => participants.add(to));
    });

    // Calculate thread duration
    const duration = sortedEmails[sortedEmails.length - 1].date.getTime() - 
                    sortedEmails[0].date.getTime();

    // Generate timeline events
    const timeline: ThreadEvent[] = this.generateTimeline(sortedEmails);

    // Analyze sentiment and topics
    const { sentiment, topics } = await this.analyzeContent(sortedEmails);

    return {
      participants: Array.from(participants),
      duration,
      messageCount: emails.length,
      sentiment,
      topics,
      timeline,
    };
  }

  private generateTimeline(emails: Email[]): ThreadEvent[] {
    const timeline: ThreadEvent[] = [];

    emails.forEach(email => {
      // Add message event
      timeline.push({
        date: email.date,
        type: 'message',
        description: `${email.from} sent: ${email.subject}`,
      });

      // Add attachment events
      if (email.hasAttachments && email.attachments) {
        email.attachments.forEach(attachment => {
          timeline.push({
            date: email.date,
            type: 'attachment',
            description: `${email.from} shared ${attachment.filename}`,
          });
        });
      }

      // Add label events
      email.labels.forEach(label => {
        timeline.push({
          date: email.date,
          type: 'label',
          description: `Thread labeled as ${label}`,
        });
      });
    });

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private async analyzeContent(emails: Email[]) {
    const allContent = emails.map(e => `${e.subject} ${e.body}`).join(' ');
    
    // Use existing EmailAnalyzer for sentiment and topics
    const analyzer = new EmailAnalyzer();
    const analysis = await analyzer.analyzeEmail({
      subject: emails[0].subject,
      body: allContent,
    });

    return {
      sentiment: analysis.sentiment,
      topics: analysis.topics,
    };
  }

  generateThreadSummary(analysis: ThreadAnalysis): string {
    const duration = format(analysis.duration, 'dd:hh:mm');
    
    return `Thread with ${analysis.participants.length} participants over ${duration}. ` +
           `Contains ${analysis.messageCount} messages. ` +
           `Main topics: ${analysis.topics.join(', ')}. ` +
           `Overall sentiment: ${analysis.sentiment}.`;
  }

  visualizeTimeline(timeline: ThreadEvent[]): ThreadVisualizationData {
    const eventsByDate = timeline.reduce((acc, event) => {
      const date = format(event.date, 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, ThreadEvent[]>);

    return {
      dates: Object.keys(eventsByDate),
      events: Object.values(eventsByDate).map(events => events.length),
      details: eventsByDate,
    };
  }
}

interface ThreadVisualizationData {
  dates: string[];
  events: number[];
  details: Record<string, ThreadEvent[]>;
}