import React from 'react';
import { Filter, Calendar, Tag } from 'lucide-react';
import type { EmailFilter } from '../types/email';

interface EmailFiltersProps {
  filters: EmailFilter;
  onFiltersChange: (filters: EmailFilter) => void;
  availableLabels: string[];
}

export function EmailFilters({ filters, onFiltersChange, availableLabels }: EmailFiltersProps) {
  return (
    <div className="bg-white p-4 border-b">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Filter by sender..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              onFiltersChange({ ...filters, from: [e.target.value] })
            }
          />
          <select
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.priority}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priority: e.target.value as EmailFilter['priority'],
              })
            }
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                after: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                before: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="flex items-center space-x-4">
          <Tag className="w-5 h-5 text-gray-500" />
          <select
            multiple
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.labels || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              onFiltersChange({ ...filters, labels: selected });
            }}
          >
            {availableLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}