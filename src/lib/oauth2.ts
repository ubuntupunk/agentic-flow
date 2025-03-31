import { google } from 'googleapis';
import { z } from 'zod';

const OAuth2Client = google.auth.OAuth2;

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
];

export const configSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
});

export type OAuth2Config = z.infer<typeof configSchema>;

export class GmailOAuth2 {
  private oauth2Client: any;

  constructor(config: OAuth2Config) {
    configSchema.parse(config);
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  setTokens(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  getClient() {
    return this.oauth2Client;
  }
}

// --- Helper Functions ---

let gmailOAuth2Instance: GmailOAuth2 | null = null;

// Export this function so emailService can use it
export function getOAuth2Client(): GmailOAuth2 {
  if (!gmailOAuth2Instance) {
    const config = {
      clientId: import.meta.env.VITE_GMAIL_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_GMAIL_REDIRECT_URI,
    };
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new Error("Missing OAuth2 environment variables (VITE_GMAIL_CLIENT_ID, VITE_GMAIL_CLIENT_SECRET, VITE_GMAIL_REDIRECT_URI)");
    }
    gmailOAuth2Instance = new GmailOAuth2(config);
  }
  return gmailOAuth2Instance;
}

export function initiateOAuthFlow(provider: 'google'): void {
  if (provider !== 'google') throw new Error('Unsupported provider');
  const client = getOAuth2Client();
  const authUrl = client.getAuthUrl();
  window.location.href = authUrl; // Redirect user to Google's auth screen
}

export async function exchangeCodeForToken(provider: 'google', code: string): Promise<void> {
  if (provider !== 'google') throw new Error('Unsupported provider');
  const client = getOAuth2Client();
  const tokens = await client.getTokens(code);
  // Store tokens securely (e.g., localStorage, sessionStorage)
  // Be mindful of security implications of storing tokens in localStorage
  localStorage.setItem(`oauth_tokens_${provider}`, JSON.stringify(tokens));
  client.setTokens(tokens); // Set credentials on the instance for immediate use
}

export function getStoredTokens(provider: 'google'): any | null {
  if (provider !== 'google') return null;
  const stored = localStorage.getItem(`oauth_tokens_${provider}`);
  if (stored) {
    try {
      const tokens = JSON.parse(stored);
      // Optional: Add validation/expiry check here
      // Refresh token if necessary before returning
      return tokens;
    } catch (e) {
      console.error("Failed to parse stored tokens", e);
      clearAuthTokens(provider); // Clear corrupted data
      return null;
    }
  }
  return null;
}

export function clearAuthTokens(provider: 'google'): void {
  if (provider !== 'google') return;
  localStorage.removeItem(`oauth_tokens_${provider}`);
  // Reset the client instance if needed, or ensure it doesn't use stale tokens
  if (gmailOAuth2Instance) {
    // Ideally, reset credentials on the existing client or re-instantiate on next use
    // For simplicity here, we just clear storage. The checkAuthStatus in useAuth
    // will handle re-authentication flow.
  }
}

// Optional: Add refresh token logic if needed by useAuth
// export async function refreshAccessTokenIfNeeded(provider: 'google'): Promise<void> { ... }

// Optional: Add getUserInfo logic
// export async function getUserInfo(provider: 'google'): Promise<UserProfile> { ... }
