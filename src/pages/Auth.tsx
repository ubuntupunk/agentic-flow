import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming a UI library like shadcn/ui
import { Mail } from 'lucide-react';
import { initiateOAuthFlow } from '@/lib/oauth2'; // Assuming this function starts the flow

const AuthPage: React.FC = () => {
  const handleLogin = () => {
    // Initiate the OAuth2 flow for Gmail
    initiateOAuthFlow('google'); // Assuming 'google' identifies the provider
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Email Manager</h1>
          <p className="mt-2 text-gray-600">Connect your email account to get started.</p>
        </div>
        <Button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md text-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center gap-2"
          size="lg"
        >
          <Mail className="h-5 w-5" />
          Connect with Gmail
        </Button>
        <p className="text-sm text-gray-500">
          By connecting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
