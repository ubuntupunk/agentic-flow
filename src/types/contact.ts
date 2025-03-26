export interface Contact {
  id: string;
  name: string;
  email: string;
  organization?: string;
  title?: string;
  phone?: string;
  address?: string;
  notes?: string;
  lastInteraction?: Date;
  labels?: string[];
}

export interface ContactGroup {
  id: string;
  name: string;
  contacts: string[];
  description?: string;
}