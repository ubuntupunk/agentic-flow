import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
// Assuming functions exist in emailService to interact with labels
import {
  listLabels as fetchLabelsFromService,
  createLabel as createLabelInService,
  deleteLabel as deleteLabelInService,
  // applyLabelToEmail as applyLabelInService, // If applying labels is handled here
} from '@/lib/emailService';

// Define a basic Label type (adjust based on actual API response)
// Export the interface so it can be imported elsewhere
export interface Label {
  id: string;
  name: string;
  // Add other properties like color, message count, etc. if available
}

interface UseLabelsResult {
  labels: Label[];
  isLoading: boolean;
  error: string | null;
  fetchLabels: () => Promise<void>;
  createLabel: (name: string) => Promise<Label | null>;
  deleteLabel: (id: string) => Promise<boolean>;
  // applyLabel?: (emailId: string, labelId: string) => Promise<boolean>;
}

export const useLabels = (): UseLabelsResult => {
  const { isAuthenticated } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    if (!isAuthenticated) {
      setLabels([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Check offline storage first?
      const fetchedLabels = await fetchLabelsFromService();
      setLabels(fetchedLabels || []); // Handle potential null/undefined response
      // TODO: Save to offline storage?
    } catch (err) {
      console.error('Failed to fetch labels:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching labels.');
      setLabels([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createLabel = useCallback(async (name: string): Promise<Label | null> => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return null;
    }
    setIsLoading(true); // Or use a specific loading state for creation
    setError(null);
    try {
      const newLabel = await createLabelInService(name);
      if (newLabel) {
        setLabels(prevLabels => [...prevLabels, newLabel]);
        return newLabel;
      }
      return null;
    } catch (err) {
      console.error('Failed to create label:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while creating the label.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteLabel = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return false;
    }
    setIsLoading(true); // Or use a specific loading state for deletion
    setError(null);
    try {
      const success = await deleteLabelInService(id);
      if (success) {
        setLabels(prevLabels => prevLabels.filter(label => label.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete label:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while deleting the label.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch labels initially when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLabels();
    } else {
      setLabels([]); // Clear labels if logged out
      setError(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchLabels]);

  return {
    labels,
    isLoading,
    error,
    fetchLabels,
    createLabel,
    deleteLabel,
  };
};
