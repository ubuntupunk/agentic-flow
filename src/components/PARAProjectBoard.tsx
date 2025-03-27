import React from 'react';
import { FolderOpen, Archive, Book, Layout } from 'lucide-react';
import type { GTDProject, PARACategory } from '../types/gtd';

interface PARAProjectBoardProps {
  projects: GTDProject[];
  onProjectUpdate: (projectId: string, updates: Partial<GTDProject>) => void;
}

export function PARAProjectBoard({ projects, onProjectUpdate }: PARAProjectBoardProps) {
  const getCategoryIcon = (category: PARACategory) => {
    switch (category) {
      case 'projects':
        return <Layout className="w-5 h-5" />;
      case 'areas':
        return <FolderOpen className="w-5 h-5" />;
      case 'resources':
        return <Book className="w-5 h-5" />;
      case 'archives':
        return <Archive className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: GTDProject['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'onHold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {['projects', 'areas', 'resources', 'archives'].map((category) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(category as PARACategory)}
            <h2 className="text-lg font-semibold capitalize">{category}</h2>
          </div>

          <div className="space-y-2">
            {projects
              .filter((project) => project.category === category)
              .map((project) => (
                <div
                  key={project.id}
                  className="p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{project.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {project.description}
                    </p>
                  )}

                  {project.dueDate && (
                    <div className="text-sm text-gray-500">
                      Due: {project.dueDate.toLocaleDateString()}
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      Tasks: {project.tasks.length}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}