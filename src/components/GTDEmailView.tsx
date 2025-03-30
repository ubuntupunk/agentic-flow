import React, { useState } from 'react';
import { Inbox, CheckSquare, Clock, Archive, Folder, Tag } from 'lucide-react';
import type { Email } from '../types/email';
import type { GTDTask, GTDContext, PARACategory } from '../types/gtd';
import { GTDTaskList } from './GTDTaskList';
import { PARAProjectBoard } from './PARAProjectBoard';

interface GTDEmailViewProps {
  email: Email;
  onTaskCreate: (task: Omit<GTDTask, 'id'>) => Promise<void>;
  onContextChange: (taskId: string, context: GTDContext) => Promise<void>;
  onCategoryChange: (taskId: string, category: PARACategory) => Promise<void>;
}

export function GTDEmailView({
  email,
  onTaskCreate,
  onContextChange,
  onCategoryChange,
}: GTDEmailViewProps) {
  const [selectedContext, setSelectedContext] = useState<GTDContext>('inbox');
  const [selectedCategory, setSelectedCategory] = useState<PARACategory>('projects');

  const handleCreateTask = async () => {
    await onTaskCreate({
      title: email.subject,
      context: selectedContext,
      paraCategory: selectedCategory,
      completed: false,
      priority: email.priority === 'high' ? 'high' : 'medium',
      tags: email.labels,
      emailId: email.id,
    });
  };

  const contexts: Array<{ value: GTDContext; label: string; icon: React.ReactNode }> = [
    { value: 'inbox', label: 'Inbox', icon: <Inbox className="w-5 h-5" /> },
    { value: 'next', label: 'Next Actions', icon: <CheckSquare className="w-5 h-5" /> },
    { value: 'waiting', label: 'Waiting For', icon: <Clock className="w-5 h-5" /> },
    { value: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-5 h-5" /> },
    { value: 'someday', label: 'Someday/Maybe', icon: <Archive className="w-5 h-5" /> },
    { value: 'reference', label: 'Reference', icon: <Folder className="w-5 h-5" /> },
  ];

  const categories: Array<{ value: PARACategory; label: string }> = [
    { value: 'projects', label: 'Projects' },
    { value: 'areas', label: 'Areas' },
    { value: 'resources', label: 'Resources' },
    { value: 'archives', label: 'Archives' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">GTD Processing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context
            </label>
            <div className="space-y-2">
              {contexts.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedContext(value)}
                  className={`flex items-center w-full p-2 rounded ${
                    selectedContext === value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {icon}
                  <span className="ml-2">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PARA Category
            </label>
            <div className="space-y-2">
              {categories.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`flex items-center w-full p-2 rounded ${
                    selectedCategory === value
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  <span className="ml-2">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <button
          onClick={handleCreateTask}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
        >
          <CheckSquare className="w-5 h-5 mr-2" />
          Create Task
        </button>
      </div>
    </div>
  );
}