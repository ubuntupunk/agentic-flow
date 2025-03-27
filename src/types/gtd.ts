export type GTDContext = 'inbox' | 'next' | 'waiting' | 'scheduled' | 'someday' | 'reference';

export type PARACategory = 'projects' | 'areas' | 'resources' | 'archives';

export interface GTDTask {
  id: string;
  title: string;
  context: GTDContext;
  paraCategory?: PARACategory;
  dueDate?: Date;
  completed: boolean;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  emailId?: string;
}

export interface GTDProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'onHold' | 'completed';
  tasks: string[];
  dueDate?: Date;
  category: PARACategory;
}

export interface GTDSettings {
  enableAutoCategories: boolean;
  defaultContext: GTDContext;
  defaultParaCategory: PARACategory;
  customContexts: string[];
  customCategories: string[];
  autoArchiveDays: number;
}