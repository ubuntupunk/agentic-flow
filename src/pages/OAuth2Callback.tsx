import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Assuming React Router for navigation
import { exchangeCodeForToken } from '@/lib/oauth2'; // Function to handle token exchange
import { Loader2 } from 'lucide-react';

const OAuth2CallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state'); // Optional: for security checks if used

      // Basic validation
      if (!code) {
        setError('Authorization code not found in callback URL.');
        setStatus('error');
        // Optionally redirect back to auth page after a delay
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // TODO: Validate state parameter if it was used during initiation

      try {
        // Exchange the authorization code for tokens
        await exchangeCodeForToken('google', code); // Assuming 'google' provider and the function handles storage
        setStatus('success');
        // Redirect to the main application dashboard
        navigate('/'); // Or '/dashboard'
      } catch (err) {
        console.error('OAuth2 token exchange failed:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during authentication.');
        setStatus('error');
        // Optionally redirect back to auth page after a delay
        setTimeout(() => navigate('/auth'), 5000);
      }
    };

    processCallback();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Processing Authentication...</h2>
            <p className="text-gray-500 mt-2">Please wait while we securely connect your account.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold text-red-600">Authentication Failed</h2>
            <p className="text-gray-600 mt-2">{error || 'Could not complete the authentication process.'}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting back to login...</p>
          </>
        )}
        {/* Success state redirects immediately, so no specific UI needed here unless desired */}
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
