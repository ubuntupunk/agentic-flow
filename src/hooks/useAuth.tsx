import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  initiateOAuthFlow,
  clearAuthTokens,
  getStoredTokens,
  // Assume a function to get user info using the access token
  // getUserInfo,
  // Assume a function to refresh tokens if needed
  // refreshAccessTokenIfNeeded,
} from '@/lib/oauth2';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tokens = getStoredTokens('google'); // Check for existing tokens
      if (tokens?.accessToken) {
        // Optional: Validate token or refresh if necessary
        // await refreshAccessTokenIfNeeded('google');
        // Optional: Fetch user info
        // const userInfo = await getUserInfo('google');
        // setUser(userInfo);

        // For now, just assume token presence means authenticated
        // A real implementation should validate the token expiry/validity
        setIsAuthenticated(true);
        // Placeholder user data if not fetching real info
        setUser({ id: 'temp-user-id', email: 'user@example.com' });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
      setError('Failed to check authentication status.');
      setIsAuthenticated(false);
      setUser(null);
      // Clear potentially invalid tokens
      clearAuthTokens('google');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(() => {
    // Reset state before initiating flow
    setIsLoading(true);
    setError(null);
    initiateOAuthFlow('google');
    // The actual setting of isAuthenticated happens after the OAuth callback succeeds
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Optional: Call provider-specific logout/revoke endpoint if available
      // await revokeToken('google');
      clearAuthTokens('google');
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout.');
    } finally {
      setIsLoading(false);
      // Optionally redirect to login page
      // window.location.href = '/auth'; // Or use react-router navigate
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
