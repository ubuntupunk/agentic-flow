import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface LabelManagerProps {
  labels: string[];
  onCreateLabel: (label: string) => Promise<void>;
  onDeleteLabel: (label: string) => Promise<void>;
  onClose: () => void;
}

export function LabelManager({ labels, onCreateLabel, onDeleteLabel, onClose }: LabelManagerProps) {
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onCreateLabel(newLabel.trim());
      setNewLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create label');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLabel = async (label: string) => {
    if (!confirm(`Are you sure you want to delete the label "${label}"?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onDeleteLabel(label);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Manage Labels</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleCreateLabel} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter new label name"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !newLabel.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {labels.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="text-gray-900">{label}</span>
              <button
                onClick={() => handleDeleteLabel(label)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}