import nlp from 'compromise';
import ical from 'ical-generator';
import type { CalendarEvent } from '../types/email';

export class CalendarExtractor {
  extractEvents(text: string): CalendarEvent[] {
    const doc = nlp(text);
    const dates = doc.dates().json();
    const events: CalendarEvent[] = [];

    dates.forEach((date: any) => {
      const sentence = doc.sentences()
        .filter((s: any) => s.text().includes(date.text))
        .first();

      if (sentence) {
        const title = this.extractEventTitle(sentence);
        const { startDate, endDate } = this.parseDateRange(date);
        const location = this.extractLocation(sentence);
        const attendees = this.extractAttendees(sentence);

        events.push({
          id: crypto.randomUUID(),
          title,
          startDate,
          endDate,
          location,
          attendees,
          description: sentence.text(),
        });
      }
    });

    return events;
  }

  private extractEventTitle(sentence: any): string {
    const topics = sentence.topics().out('array');
    if (topics.length > 0) {
      return topics[0];
    }
    
    const nouns = sentence.nouns().out('array');
    return nouns[0] || 'Untitled Event';
  }

  private parseDateRange(date: any): { startDate: Date; endDate: Date } {
    const startDate = new Date(date.start || date.date);
    const endDate = date.end ? new Date(date.end) : new Date(startDate.getTime() + 3600000);
    return { startDate, endDate };
  }

  private extractLocation(sentence: any): string | undefined {
    const places = sentence.places().out('array');
    return places.length > 0 ? places[0] : undefined;
  }

  private extractAttendees(sentence: any): string[] {
    return sentence.people().out('array');
  }

  generateICS(event: CalendarEvent): string {
    const calendar = ical({
      events: [{
        start: event.startDate,
        end: event.endDate,
        summary: event.title,
        description: event.description,
        location: event.location,
        attendees: event.attendees.map(email => ({ email })),
      }],
    });

    return calendar.toString();
  }
}