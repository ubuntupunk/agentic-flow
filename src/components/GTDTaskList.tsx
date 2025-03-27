import React from 'react';
import { CheckCircle, Circle, Clock, Calendar, Tag } from 'lucide-react';
import type { GTDTask } from '../types/gtd';

interface GTDTaskListProps {
  tasks: GTDTask[];
  onTaskComplete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<GTDTask>) => void;
}

export function GTDTaskList({ tasks, onTaskComplete, onTaskUpdate }: GTDTaskListProps) {
  const getPriorityColor = (priority: GTDTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 bg-white rounded-lg shadow ${
            task.completed ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onTaskComplete(task.id)}
                className="focus:outline-none"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </span>
            </div>
            <span className={getPriorityColor(task.priority)}>●</span>
          </div>

          <div className="mt-2 ml-8 space-y-2">
            {task.dueDate && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {task.dueDate.toLocaleDateString()}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              {task.context}
            </div>

            {task.paraCategory && (
              <div className="flex items-center text-sm text-gray-500">
                <Tag className="w-4 h-4 mr-2" />
                {task.paraCategory}
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {task.notes && (
              <p className="text-sm text-gray-600">{task.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}