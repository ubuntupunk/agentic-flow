import { pipeline } from '@xenova/transformers';
import type { GTDTask, GTDProject, GTDContext, PARACategory, GTDSettings } from '../types/gtd';
import type { Email } from '../types/email';

export class GTDManager {
  private classifier: any;
  private settings: GTDSettings;
  private tasks: Map<string, GTDTask>;
  private projects: Map<string, GTDProject>;

  constructor(settings: GTDSettings) {
    this.settings = settings;
    this.tasks = new Map();
    this.projects = new Map();
    this.initializeClassifier();
  }

  private async initializeClassifier() {
    try {
      this.classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-gtd-classifier'
      );
    } catch (error) {
      console.error('Failed to initialize GTD classifier:', error);
    }
  }

  async categorizeEmail(email: Email): Promise<GTDTask> {
    const context = await this.predictContext(email);
    const paraCategory = await this.predictPARACategory(email);

    const task: GTDTask = {
      id: crypto.randomUUID(),
      title: email.subject,
      context,
      paraCategory,
      completed: false,
      priority: this.determinePriority(email),
      tags: this.extractTags(email),
      emailId: email.id,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  private async predictContext(email: Email): Promise<GTDContext> {
    if (!this.classifier) {
      return this.settings.defaultContext;
    }

    const text = `${email.subject} ${email.body}`;
    const prediction = await this.classifier(text);
    return this.mapPredictionToContext(prediction[0].label);
  }

  private async predictPARACategory(email: Email): Promise<PARACategory> {
    const projectIndicators = ['project', 'initiative', 'launch'];
    const areaIndicators = ['responsibility', 'role', 'maintain'];
    const resourceIndicators = ['reference', 'learn', 'research'];

    const text = `${email.subject} ${email.body}`.toLowerCase();

    if (projectIndicators.some(indicator => text.includes(indicator))) {
      return 'projects';
    }
    if (areaIndicators.some(indicator => text.includes(indicator))) {
      return 'areas';
    }
    if (resourceIndicators.some(indicator => text.includes(indicator))) {
      return 'resources';
    }

    return this.settings.defaultParaCategory;
  }

  private determinePriority(email: Email): GTDTask['priority'] {
    const urgentTerms = ['urgent', 'asap', 'immediately'];
    const importantTerms = ['important', 'critical', 'essential'];

    const text = `${email.subject} ${email.body}`.toLowerCase();

    if (urgentTerms.some(term => text.includes(term))) {
      return 'high';
    }
    if (importantTerms.some(term => text.includes(term))) {
      return 'medium';
    }
    return 'low';
  }

  private extractTags(email: Email): string[] {
    const tags = new Set<string>();
    
    // Extract hashtags
    const hashtagRegex = /#[\w-]+/g;
    const matches = `${email.subject} ${email.body}`.match(hashtagRegex) || [];
    matches.forEach(tag => tags.add(tag.slice(1)));

    // Add email labels as tags
    email.labels.forEach(label => tags.add(label));

    return Array.from(tags);
  }

  private mapPredictionToContext(prediction: string): GTDContext {
    const contextMap: Record<string, GTDContext> = {
      INBOX: 'inbox',
      NEXT: 'next',
      WAITING: 'waiting',
      SCHEDULED: 'scheduled',
      SOMEDAY: 'someday',
      REFERENCE: 'reference',
    };

    return contextMap[prediction] || this.settings.defaultContext;
  }

  createProject(name: string, category: PARACategory): GTDProject {
    const project: GTDProject = {
      id: crypto.randomUUID(),
      name,
      status: 'active',
      tasks: [],
      category,
    };

    this.projects.set(project.id, project);
    return project;
  }

  addTaskToProject(taskId: string, projectId: string): boolean {
    const project = this.projects.get(projectId);
    const task = this.tasks.get(taskId);

    if (!project || !task) return false;

    project.tasks.push(taskId);
    task.paraCategory = project.category;
    return true;
  }

  updateTaskContext(taskId: string, context: GTDContext): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.context = context;
    return true;
  }

  completeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.completed = true;
    return true;
  }

  getTasksByContext(context: GTDContext): GTDTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.context === context);
  }

  getProjectsByCategory(category: PARACategory): GTDProject[] {
    return Array.from(this.projects.values())
      .filter(project => project.category === category);
  }

  updateSettings(newSettings: Partial<GTDSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }
}