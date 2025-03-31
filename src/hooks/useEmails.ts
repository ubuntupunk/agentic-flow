import { useState, useEffect, useCallback } from 'react';
import { Email } from '@/types/email'; // Assuming Email type definition exists
import { listEmails as fetchEmailsFromService } from '@/lib/emailService'; // Assuming a function to fetch emails
import { useAuth } from '@/hooks/useAuth.tsx'; // Need auth status/token

// Define potential filter types based on documentation
interface EmailFilter {
  label?: string;
  category?: string; // e.g., 'Primary', 'Social'
  priority?: 'high' | 'normal' | 'low';
  unread?: boolean;
  searchTerm?: string;
  // Add other potential filters like date range, sender, etc.
}

interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: string | null;
  fetchEmails: (filter?: EmailFilter) => Promise<void>;
  // Add functions for sending, deleting, labeling emails if managed here
}

export const useEmails = (initialFilter?: EmailFilter): UseEmailsResult => {
  const { isAuthenticated } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<EmailFilter | undefined>(initialFilter);

  const fetchEmails = useCallback(async (filter: EmailFilter = currentFilter || {}) => {
    if (!isAuthenticated) {
      // Don't fetch if not authenticated
      // console.log('useEmails: Not authenticated, skipping fetch.');
      setEmails([]); // Clear emails if logged out
      return;
    }

    // console.log('useEmails: Fetching emails with filter:', filter);
    setIsLoading(true);
    setError(null);
    setCurrentFilter(filter); // Update current filter

    try {
      // TODO: Integrate offline storage check/fetch first
      // const offlineEmails = await offlineStorage.searchEmails(filter);
      // if (offlineEmails.length > 0) {
      //   setEmails(offlineEmails);
      //   setIsLoading(false);
      //   // Optionally trigger background sync
      //   triggerBackgroundSync();
      //   return;
      // }

      // Fetch from the actual email service (e.g., Gmail API)
      const fetchedEmails = await fetchEmailsFromService(filter);
      setEmails(fetchedEmails);

      // TODO: Save fetched emails to offline storage
      // await offlineStorage.saveEmails(fetchedEmails);

    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching emails.');
      setEmails([]); // Clear emails on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentFilter]); // Dependency on auth status and filter

  // Initial fetch when the hook mounts or auth status changes
  useEffect(() => {
    // console.log('useEmails: Auth status changed or component mounted. isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      fetchEmails(currentFilter);
    } else {
      // Clear state if user logs out
      setEmails([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchEmails]); // Rerun effect if auth status changes

  // Optional: Add functions for email actions (send, delete, label)
  // const sendEmail = useCallback(async (emailData) => { ... }, [isAuthenticated]);
  // const deleteEmail = useCallback(async (emailId) => { ... }, [isAuthenticated]);
  // const applyLabel = useCallback(async (emailId, label) => { ... }, [isAuthenticated]);

  return {
    emails,
    isLoading,
    error,
    fetchEmails,
    // sendEmail,
    // deleteEmail,
    // applyLabel,
  };
};
