import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Tag, Paperclip } from 'lucide-react';
import type { Email } from '../types/email';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  onAddLabel: (label: string) => Promise<void>;
}

export function EmailDetail({ email, onClose, onAddLabel }: EmailDetailProps) {
  const [newLabel, setNewLabel] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsAddingLabel(true);
    setError(null);
    try {
      await onAddLabel(newLabel.trim());
      setNewLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add label');
    } finally {
      setIsAddingLabel(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            {email.subject}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-900 font-medium">{email.from}</p>
              <p className="text-gray-500 text-sm">
                {format(email.date, 'PPP p')}
              </p>
            </div>
            {email.hasAttachments && (
              <Paperclip className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: email.body }} />
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {email.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddLabel} className="flex gap-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add new label"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAddingLabel}
              />
              <button
                type="submit"
                disabled={isAddingLabel || !newLabel.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Tag className="w-4 h-4 mr-2" />
                Add Label
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}