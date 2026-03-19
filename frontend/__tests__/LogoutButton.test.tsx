// LogoutButton.test.tsx
// Tests for the LogoutButton component
// - Rendering
// - Click handler (calls signOut and redirects)
// - Disabled/loading state
// - Edge cases

import React from 'react';

// Mock functions
const mockPush = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({ error: null });

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LogoutButton } from '../src/components/generic/LogoutButton';

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logout icon button', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls signOut and redirects on click', async () => {
    render(<LogoutButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    });
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('shows loading spinner when loading', async () => {
    // Make signOut take some time to resolve
    let resolveSignOut: ((value: { error: unknown }) => void) | undefined;
    mockSignOut.mockImplementation(
      () => new Promise((resolve) => (resolveSignOut = resolve))
    );
    render(<LogoutButton />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    });
    // Spinner should appear
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    // Finish signOut
    await act(async () => {
      resolveSignOut?.({ error: null });
    });
  });
});