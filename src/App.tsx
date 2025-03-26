import React, { useState, useEffect } from 'react';
import { Mail, LogIn, Plus, Settings } from 'lucide-react';
import { EmailList } from './components/EmailList';
import { EmailFilters } from './components/EmailFilters';
import { EmailDetail } from './components/EmailDetail';
import { ComposeEmail } from './components/ComposeEmail';
import { LabelManager } from './components/LabelManager';
import { GmailOAuth2 } from './lib/oauth2';
import { GmailAPI } from './lib/gmail';
import { EmailService } from './lib/emailService';
import type { Email, EmailFilter } from './types/email';

const oauth2Config = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/oauth2callback`,
};

function App() {
  const [filters, setFilters] = useState<EmailFilter>({
    priority: 'normal',
  });
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [labelSyncConfig, setLabelSyncConfig] = useState({
    include: [],
    exclude: ['CATEGORY_', 'CHAT', 'SENT', 'INBOX', 'TRASH', 'SPAM']
  });

  const oauth2Client = new GmailOAuth2(oauth2Config);
  const gmailAPI = new GmailAPI(oauth2Config);
  const emailService = new EmailService(oauth2Config);

  useEffect(() => {
    const tokens = localStorage.getItem('gmail_tokens');
    if (tokens) {
      setIsAuthenticated(true);
      fetchEmails();
      syncLabels();
    }
  }, [filters]);

  const handleAuth = () => {
    const authUrl = oauth2Client.getAuthUrl();
    window.location.href = authUrl;
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmails = await gmailAPI.listEmails(filters);
      setEmails(fetchedEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
    } finally {
      setIsLoading(false);
    }
  };

  const syncLabels = async () => {
    try {
      const labels = await emailService.syncLabels(labelSyncConfig);
      setAvailableLabels(labels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync labels');
    }
  };

  const handleSendEmail = async (email: { to: string; subject: string; body: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await emailService.sendEmail(email);
      setIsComposing(false);
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLabel = async (label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await gmailAPI.createLabel(label);
      await syncLabels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create label');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLabel = async (label: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const labelId = await gmailAPI.getLabelId(label);
      if (labelId) {
        await gmailAPI.deleteLabel(labelId);
        await syncLabels();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900">Smart Email Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsComposing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Compose
                  </button>
                  <button
                    onClick={() => setShowLabelManager(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Labels
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAuth}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {isAuthenticated ? (
          <div className="bg-white rounded-lg shadow">
            <EmailFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableLabels={availableLabels}
            />
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <EmailList
                emails={emails}
                onEmailSelect={setSelectedEmail}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              Please sign in to access your emails
            </h2>
            <p className="mt-2 text-gray-600">
              We use secure OAuth2 authentication to protect your data
            </p>
          </div>
        )}
      </main>

      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onAddLabel={handleAddLabel}
        />
      )}

      {isComposing && (
        <ComposeEmail
          onClose={() => setIsComposing(false)}
          onSend={handleSendEmail}
        />
      )}

      {showLabelManager && (
        <LabelManager
          labels={availableLabels}
          onCreateLabel={handleAddLabel}
          onDeleteLabel={handleDeleteLabel}
          onClose={() => setShowLabelManager(false)}
        />
      )}
    </div>
  );
}

export default App;