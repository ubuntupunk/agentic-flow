import React, { useState, useCallback } from 'react'; // Import useState, useCallback
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useEmails } from '@/hooks/useEmails'; // Import useEmails
import { useLabels } from '@/hooks/useLabels'; // Import useLabels
import { EmailList } from '@/components/EmailList';
import { SearchBar } from '@/components/SearchBar';
import { LabelManager } from '@/components/LabelManager';
import { ComposeEmail } from '@/components/ComposeEmail';
import { Button } from '@/components/ui/button'; // Comment out for now - requires UI lib setup
import { LayoutDashboard, LogOut, PlusCircle } from 'lucide-react';
import type { Email } from '@/types/email'; // Import Email type for selection state
import { EmailDetail } from '@/components/EmailDetail';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading, logout, user } = useAuth();
  const { labels, isLoading: isLabelsLoading, createLabel, deleteLabel } = useLabels();
  const { emails, isLoading: isEmailsLoading, fetchEmails } = useEmails(); // Add fetchEmails if needed for search/filter
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null); // State for selected email
  const [emailLabels, setEmailLabels] = useState<{ [emailId: string]: string[] }>({});

  // Combine loading states
  const isLoading = isAuthLoading || isLabelsLoading || isEmailsLoading;

  // Callbacks
  // Update handleSearch to match SearchBarProps expectation
  const handleSearch = useCallback(async (query: string, type: "fuzzy" | "semantic" | "combined" = "combined") => {
    console.log(`Searching for "${query}" using ${type} search`);
    // TODO: Adapt fetchEmails or search logic based on type if necessary
    await fetchEmails({ searchTerm: query });
  }, [fetchEmails]);

  const handleEmailSelect = useCallback((email: Email) => {
    console.log('Email selected:', email.id);
    setSelectedEmail(email);
    // TODO: Display email details, maybe in a separate panel or modal
  }, []);

  const handleSendEmail = useCallback(async (emailData: any) => {
    console.log('Sending email:', emailData);
    try {
      const { getEmailServiceInstance } = await import('@/lib/emailService');
      const service = await getEmailServiceInstance();
      if (service) {
        await service.sendEmail({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
        });
        setIsComposeOpen(false); // Close compose modal on send
      } else {
        console.error('Email service is not initialized.');
        // TODO: Implement error handling (e.g., display an error message to the user)
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // TODO: Implement error handling (e.g., display an error message to the user)
    }
  }, []);

  const handleAddLabelToEmail = useCallback(
    (emailId: string, labelName: string) => {
      console.log(`Adding label "${labelName}" to email ${emailId}`);
      // TODO: Implement logic to add label to email
      return new Promise<void>((resolve) => {
        setEmailLabels((prevEmailLabels) => {
          const updatedLabels = { ...prevEmailLabels };
          if (updatedLabels[emailId]) {
            updatedLabels[emailId] = [...updatedLabels[emailId], labelName];
          } else {
            updatedLabels[emailId] = [labelName];
          }
          resolve();
          return updatedLabels;
        });
      });
    },
    [setEmailLabels]
  );

  const handleCreateLabel = useCallback(async (name: string) => {
      console.log('Creating label:', name);
      await createLabel(name);
  }, [createLabel]);

   const handleDeleteLabel = useCallback(async (id: string) => {
       console.log('Deleting label:', id);
       await deleteLabel(id);
   }, [deleteLabel]);


  if (isLoading) {
    // Improved loading state
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Smart Mail</h2>
          {user && <p className="text-sm text-gray-400 truncate">{user.email}</p>}
        </div>
        <nav className="flex-1 space-y-2">
          
          <Button
            className="w-full flex items-center justify-start text-left px-2 py-1.5 text-sm rounded-md text-white hover:bg-gray-700"
            onClick={() => setIsComposeOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Compose
          </Button>
          <Button className="w-full flex items-center justify-start text-left px-2 py-1.5 text-sm rounded-md text-white hover:bg-gray-700">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Inbox
          </Button>
          {/* LabelManager with props */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Labels</h3>
            {/* Map Label objects to strings (names) for the component */}
            <LabelManager
                labels={labels.map(label => label.name)}
                onCreateLabel={handleCreateLabel}
                onDeleteLabel={handleDeleteLabel} // Note: onDeleteLabel might need the ID, this could be an issue if LabelManager only gets names. Needs review of LabelManager component itself.
                onClose={() => {}} // Pass dummy onClose to satisfy prop requirement
            />
          </div>
        </nav>
        <div className="mt-auto">
          
          <Button
            className="w-full flex items-center justify-start text-left px-2 py-1.5 text-sm rounded-md text-white hover:bg-gray-700"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area - TODO: Add Email Detail View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          {/* SearchBar with props */}
          <SearchBar onSearch={handleSearch} />
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Email List Component with props */}
          <EmailList emails={emails} onEmailSelect={handleEmailSelect} />
          {/* TODO: Add EmailDetail component here, conditionally rendered based on selectedEmail */}
          {selectedEmail && (
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onAddLabel={handleAddLabelToEmail}
            />
          )}
        </div>
      </main>

      {/* Compose Email Modal/Dialog with props */}
      {isComposeOpen && (
        <ComposeEmail
          onClose={() => setIsComposeOpen(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
};

export default DashboardPage;
