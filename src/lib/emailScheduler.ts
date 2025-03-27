import schedule from 'node-schedule';
import type { Email } from '../types/email';
import { EmailService } from './emailService';

export class EmailScheduler {
  private scheduledEmails: Map<string, schedule.Job>;
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.scheduledEmails = new Map();
    this.emailService = emailService;
  }

  scheduleEmail(email: Email, scheduledDate: Date): string {
    const jobId = crypto.randomUUID();

    const job = schedule.scheduleJob(scheduledDate, async () => {
      try {
        await this.emailService.sendEmail({
          to: email.to.join(','),
          subject: email.subject,
          body: email.body,
        });
        this.scheduledEmails.delete(jobId);
      } catch (error) {
        console.error('Failed to send scheduled email:', error);
      }
    });

    this.scheduledEmails.set(jobId, job);
    return jobId;
  }

  cancelScheduledEmail(jobId: string): boolean {
    const job = this.scheduledEmails.get(jobId);
    if (job) {
      job.cancel();
      this.scheduledEmails.delete(jobId);
      return true;
    }
    return false;
  }

  getScheduledEmails(): { id: string; date: Date }[] {
    return Array.from(this.scheduledEmails.entries()).map(([id, job]) => ({
      id,
      date: job.nextInvocation(),
    }));
  }

  rescheduleEmail(jobId: string, newDate: Date): boolean {
    const job = this.scheduledEmails.get(jobId);
    if (job) {
      job.reschedule(newDate);
      return true;
    }
    return false;
  }
}