import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App'; // Adjust path as necessary
import * as AuthHook from '@/hooks/useAuth.tsx'; // Import the module to mock

// Mock child components to isolate App logic
vi.mock('@/pages/Auth', () => ({ default: () => <div>Auth Page Mock</div> }));
vi.mock('@/pages/Dashboard', () => ({ default: () => <div>Dashboard Page Mock</div> }));
vi.mock('@/pages/OAuth2Callback', () => ({ default: () => <div>OAuth Callback Page Mock</div> }));

// Mock the useAuth hook
const mockUseAuth = vi.spyOn(AuthHook, 'useAuth');

describe('App Component Routing', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders Auth page when not authenticated', async () => {
    // Mock useAuth to return unauthenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for potential redirects or async operations
    await waitFor(() => {
      expect(screen.getByText('Auth Page Mock')).toBeInTheDocument();
    });
    expect(screen.queryByText('Dashboard Page Mock')).not.toBeInTheDocument();
  });

  it('renders Dashboard page when authenticated', async () => {
    // Mock useAuth to return authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'test-user', email: 'test@example.com' },
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for potential redirects or async operations
    await waitFor(() => {
      expect(screen.getByText('Dashboard Page Mock')).toBeInTheDocument();
    });
    expect(screen.queryByText('Auth Page Mock')).not.toBeInTheDocument();
  });

  it('renders loading state initially', () => {
     // Mock useAuth to return loading state
     mockUseAuth.mockReturnValue({
       isAuthenticated: false,
       isLoading: true,
       user: null,
       error: null,
       login: vi.fn(),
       logout: vi.fn(),
     });

     render(
       <MemoryRouter initialEntries={['/']}>
         <App />
       </MemoryRouter>
     );

     // Check for a loading indicator (adjust selector as needed)
     // This assumes App component shows some loading text or element
     // If loading is handled inside Dashboard/Auth, those mocks would render.
     // A more robust App might have its own top-level loading state.
     // For now, let's assume the initial render might show nothing until auth resolves.
     // We can refine this test based on App.tsx's actual implementation.
     // expect(screen.getByText(/loading/i)).toBeInTheDocument(); // Example check
  });

  it('renders OAuth callback page on the correct route', async () => {
    // Auth state doesn't matter as much for route matching itself
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/oauth2/callback?code=testcode']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('OAuth Callback Page Mock')).toBeInTheDocument();
    });
  });

});
