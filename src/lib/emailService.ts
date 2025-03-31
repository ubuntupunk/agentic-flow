import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';
import type { Email, EmailAttachment } from '../types/email'; // Assuming this type is defined correctly
import type { Label } from '@/hooks/useLabels'; // Import Label type
// Import the helper to get the authenticated client and tokens
import { getStoredTokens, getOAuth2Client, clearAuthTokens } from './oauth2';

// Define EmailFilter if not imported (matching useEmails.ts)
interface EmailFilter {
  label?: string;
  category?: string;
  priority?: 'high' | 'normal' | 'low';
  unread?: boolean;
  searchTerm?: string;
  maxResults?: number; // Add maxResults for pagination/limiting
  pageToken?: string; // For pagination
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

// Note: LabelSyncConfig seems unused with the current implementation, removed for now
// interface LabelSyncConfig {
//   include: string[];
//   exclude: string[];
// }

export class EmailService {
  private gmail: gmail_v1.Gmail; // Use specific type

  constructor(auth: any) {
    // TODO: Ensure 'auth' is the authenticated OAuth2 client instance
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async sendEmail({ to, subject, body }: SendEmailParams): Promise<void> {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];
      const message = messageParts.join('\n');
      // Base64url encode
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw for caller to handle
    }
  }

  // Note: syncLabels seems unused, removed for now. listLabels is used instead.
  // async syncLabels(config: LabelSyncConfig) { ... }

  async listMessages(filter: EmailFilter = {}): Promise<{ messages: gmail_v1.Schema$Message[], nextPageToken?: string | null }> {
    let queryParts: string[] = [];
    if (filter.unread) queryParts.push('is:unread');
    if (filter.label) queryParts.push(`label:${filter.label.replace(/\s/g, '-')}`); // Gmail labels use hyphens for spaces in queries
    if (filter.category) queryParts.push(`category:${filter.category}`);
    // Add more query parts based on filter properties (priority, searchTerm)
    if (filter.searchTerm) queryParts.push(filter.searchTerm);

    const query = queryParts.join(' ');

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query || undefined,
        maxResults: filter.maxResults || 25,
        pageToken: filter.pageToken || undefined,
      });
      return {
        messages: response.data.messages || [],
        nextPageToken: response.data.nextPageToken
      };
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  async getMessageDetails(messageId: string): Promise<Email | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full', // Get headers, body, structure
      });

      const message = response.data;
      if (!message || !message.id) return null;

      const decodeBase64Url = (input: string | null | undefined): string => {
        if (!input) return '';
        try {
          return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        } catch (e) {
          console.error("Base64 decoding failed:", e);
          return ''; // Return empty string on error
        }
      };

      const headers = message.payload?.headers || [];
      const getHeader = (name: string): string => headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      let bodyContent = '';
      let attachments: EmailAttachment[] = [];

      const processPart = (part: gmail_v1.Schema$MessagePart) => {
        // Extract Attachments
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType || 'application/octet-stream',
            size: part.body.size || 0,
            attachmentId: part.body.attachmentId,
            partId: part.partId || '', // partId might be needed for fetching
          });
        }

        // Extract Body Content (prioritize HTML)
        if (!bodyContent || part.mimeType === 'text/html') {
           if (part.mimeType === 'text/html' && part.body?.data) {
             bodyContent = decodeBase64Url(part.body.data);
           } else if (part.mimeType === 'text/plain' && part.body?.data && !bodyContent) { // Only use plain text if HTML not found yet
             bodyContent = decodeBase64Url(part.body.data);
           }
        }


        // Recursively process nested parts
        if (part.parts) {
          part.parts.forEach(processPart);
        }
      };

      if (message.payload) {
        processPart(message.payload);
      }

      // Fallback to snippet if body is still empty
      if (!bodyContent) {
        bodyContent = decodeBase64Url(message.snippet);
      }

      const email: Email = {
        id: message.id,
        threadId: message.threadId || undefined,
        from: getHeader('From'),
        to: getHeader('To').split(',').map((s: string) => s.trim()).filter(Boolean),
        cc: getHeader('Cc').split(',').map((s: string) => s.trim()).filter(Boolean),
        bcc: getHeader('Bcc').split(',').map((s: string) => s.trim()).filter(Boolean),
        subject: getHeader('Subject'),
        body: bodyContent,
        snippet: message.snippet || '',
        date: new Date(parseInt(message.internalDate || '0', 10)),
        labels: message.labelIds || [],
        isUnread: message.labelIds?.includes('UNREAD') || false,
        priority: 'normal', // Default priority - TODO: Implement logic based on labels/content?
        attachments: attachments,
        // category: undefined, // TODO: Implement category detection
      };

      return email;
    } catch (error) {
      console.error(`Error getting message details for ${messageId}:`, error);
      return null;
    }
  }

  async listLabels(): Promise<Label[]> {
    try {
      const response = await this.gmail.users.labels.list({ userId: 'me' });
      const labels = response.data.labels || [];
      return labels
        .filter((l: gmail_v1.Schema$Label) => l.type === 'user') // Only user-defined labels
        .map((l: gmail_v1.Schema$Label) => ({
          id: l.id || '',
          name: l.name || 'Unnamed Label',
        }));
    } catch (error) {
      console.error('Error listing labels:', error);
      throw error;
    }
  }

  async createLabel(name: string): Promise<Label | null> {
    try {
      const response = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'messageShow',
        },
      });
      const newLabel = response.data;
      if (!newLabel || !newLabel.id) return null;
      return {
        id: newLabel.id,
        name: newLabel.name || '',
      };
    } catch (error) {
      console.error(`Error creating label "${name}":`, error);
      throw error;
    }
  }

  async deleteLabel(id: string): Promise<boolean> {
    try {
      await this.gmail.users.labels.delete({
        userId: 'me',
        id: id,
      });
      return true;
    } catch (error) {
      console.error(`Error deleting label ${id}:`, error);
      return false; // Return false on error
    }
  }
}

// --- Helper Functions ---

let emailServiceInstance: EmailService | null = null;

// Gets the singleton instance, ensuring authentication
async function getEmailServiceInstance(): Promise<EmailService> {
  // TODO: Add robust token checking and refreshing logic here
  // This is a simplified version
  if (!emailServiceInstance) {
      const tokens = getStoredTokens('google');
      if (!tokens) {
        throw new Error("User not authenticated");
      }
      const oauth2ClientInstance = getOAuth2Client();
      oauth2ClientInstance.setTokens(tokens);
      emailServiceInstance = new EmailService(oauth2ClientInstance.getClient());
  }
   // Ensure tokens are set on the client before returning
   const tokens = getStoredTokens('google');
   if (!tokens) {
     emailServiceInstance = null; // Invalidate instance if tokens are gone
     throw new Error("User not authenticated");
   }
   getOAuth2Client().setTokens(tokens); // Refresh tokens on the client

  return emailServiceInstance;
}

// Exported functions for hooks/components to use
export async function listEmails(filter: EmailFilter = {}): Promise<Email[]> {
  try {
    const service = await getEmailServiceInstance();
    // Note: listMessages returns only IDs. We need details.
    const listResponse = await service.listMessages(filter);
    const messageIds = listResponse.messages.map(msg => msg.id).filter((id): id is string => !!id);

    if (!messageIds.length) return [];

    // Fetch details for each message ID concurrently
    const emailDetailsPromises = messageIds.map(id => service.getMessageDetails(id));
    const emailDetailsResults = await Promise.allSettled(emailDetailsPromises);

    // Filter out failed promises and null results
    const emails = emailDetailsResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => (result as PromiseFulfilledResult<Email>).value);

    return emails;

  } catch (error) {
    if (error instanceof Error && error.message.includes("authenticated")) {
       clearAuthTokens('google');
       console.error("Authentication error in listEmails, tokens cleared.");
       // Potentially trigger re-authentication flow here
    } else {
       console.error("listEmails failed:", error);
    }
    return []; // Return empty array on error
  }
}

export async function listLabels(): Promise<Label[]> {
   try {
     const service = await getEmailServiceInstance();
     return await service.listLabels();
   } catch (error) {
     if (error instanceof Error && error.message.includes("authenticated")) {
        clearAuthTokens('google');
        console.error("Authentication error in listLabels, tokens cleared.");
     } else {
        console.error("listLabels failed:", error);
     }
     return [];
   }
}

export async function createLabel(name: string): Promise<Label | null> {
   try {
     const service = await getEmailServiceInstance();
     return await service.createLabel(name);
   } catch (error) {
     if (error instanceof Error && error.message.includes("authenticated")) {
        clearAuthTokens('google');
        console.error("Authentication error in createLabel, tokens cleared.");
     } else {
        console.error("createLabel failed:", error);
     }
     return null;
   }
}

export async function deleteLabel(id: string): Promise<boolean> {
   try {
     const service = await getEmailServiceInstance();
     return await service.deleteLabel(id);
   } catch (error) {
     if (error instanceof Error && error.message.includes("authenticated")) {
        clearAuthTokens('google');
        console.error("Authentication error in deleteLabel, tokens cleared.");
     } else {
        console.error("deleteLabel failed:", error);
     }
     return false;
   }
}
