import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Email } from '../types/email';
import type { Contact } from '../types/contact';
import type { GTDTask } from '../types/gtd';

interface EmailDBSchema extends DBSchema {
  emails: {
    key: string;
    value: Email;
    indexes: {
      'by-date': Date;
      'by-from': string;
      'by-labels': string[];
    };
  };
  contacts: {
    key: string;
    value: Contact;
    indexes: {
      'by-email': string;
      'by-organization': string;
    };
  };
  tasks: {
    key: string;
    value: GTDTask;
    indexes: {
      'by-context': string;
      'by-category': string;
      'by-completed': boolean;
    };
  };
  syncState: {
    key: string;
    value: {
      lastSync: Date;
      status: 'idle' | 'syncing' | 'error';
      error?: string;
    };
  };
}

export class OfflineStorage {
  private db: IDBPDatabase<EmailDBSchema> | null = null;
  private readonly DB_NAME = 'email-manager-db';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    this.db = await openDB<EmailDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Emails store
        const emailStore = db.createObjectStore('emails', { keyPath: 'id' });
        emailStore.createIndex('by-date', 'date');
        emailStore.createIndex('by-from', 'from');
        emailStore.createIndex('by-labels', 'labels', { multiEntry: true });

        // Contacts store
        const contactStore = db.createObjectStore('contacts', { keyPath: 'id' });
        contactStore.createIndex('by-email', 'email', { unique: true });
        contactStore.createIndex('by-organization', 'organization');

        // Tasks store
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-context', 'context');
        taskStore.createIndex('by-category', 'paraCategory');
        taskStore.createIndex('by-completed', 'completed');

        // Sync state store
        db.createObjectStore('syncState', { keyPath: 'id' });
      },
    });
  }

  // Email operations
  async saveEmail(email: Email): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('emails', email);
  }

  async getEmail(id: string): Promise<Email | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('emails', id);
  }

  async getAllEmails(): Promise<Email[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('emails');
  }

  async deleteEmail(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('emails', id);
  }

  // Contact operations
  async saveContact(contact: Contact): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('contacts', contact);
  }

  async getContact(id: string): Promise<Contact | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('contacts', id);
  }

  async getAllContacts(): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('contacts');
  }

  async deleteContact(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('contacts', id);
  }

  // Task operations
  async saveTask(task: GTDTask): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('tasks', task);
  }

  async getTask(id: string): Promise<GTDTask | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('tasks', id);
  }

  async getAllTasks(): Promise<GTDTask[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAll('tasks');
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('tasks', id);
  }

  // Sync state operations
  async updateSyncState(status: 'idle' | 'syncing' | 'error', error?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('syncState', {
      id: 'current',
      lastSync: new Date(),
      status,
      error,
    });
  }

  async getSyncState(): Promise<{
    lastSync: Date;
    status: 'idle' | 'syncing' | 'error';
    error?: string;
  } | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('syncState', 'current');
  }

  // Search operations
  async searchEmails(query: string): Promise<Email[]> {
    if (!this.db) throw new Error('Database not initialized');
    const emails = await this.getAllEmails();
    return emails.filter(email => 
      email.subject.toLowerCase().includes(query.toLowerCase()) ||
      email.body.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getEmailsByLabel(label: string): Promise<Email[]> {
    if (!this.db) throw new Error('Database not initialized');
    const index = this.db.transaction('emails').store.index('by-labels');
    return await index.getAll(label);
  }

  async getContactsByOrganization(organization: string): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');
    const index = this.db.transaction('contacts').store.index('by-organization');
    return await index.getAll(organization);
  }

  async getTasksByContext(context: string): Promise<GTDTask[]> {
    if (!this.db) throw new Error('Database not initialized');
    const index = this.db.transaction('tasks').store.index('by-context');
    return await index.getAll(context);
  }
}