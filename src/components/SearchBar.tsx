import React, { useState, useCallback } from 'react';
import { Search, Loader } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string, type: 'fuzzy' | 'semantic' | 'combined') => Promise<void>;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'fuzzy' | 'semantic' | 'combined'>('combined');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, type: typeof searchType) => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        try {
          await onSearch(searchQuery, type);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, searchType);
  };

  return (
    <div className="flex items-center space-x-2 p-4 bg-white border-b">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search emails..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value as typeof searchType)}
        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="combined">Smart Search</option>
        <option value="fuzzy">Fuzzy Search</option>
        <option value="semantic">Semantic Search</option>
      </select>
    </div>
  );
}