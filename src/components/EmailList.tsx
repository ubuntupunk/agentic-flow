import React from 'react';
import { format } from 'date-fns';
import { Paperclip, Star, AlertCircle } from 'lucide-react';
import type { Email } from '../types/email';

interface EmailListProps {
  emails: Email[];
  onEmailSelect: (email: Email) => void;
}

export function EmailList({ emails, onEmailSelect }: EmailListProps) {
  const getPriorityIcon = (priority: Email['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'normal':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <div
          key={email.id}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          onClick={() => onEmailSelect(email)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPriorityIcon(email.priority)}
              <div>
                <h3 className="text-sm font-medium text-gray-900">{email.from}</h3>
                <p className="text-sm text-gray-600">{email.subject}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {email.hasAttachments && (
                <Paperclip className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-500">
                {format(email.date, 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600 line-clamp-2">{email.body}</p>
          </div>
          {email.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {email.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}