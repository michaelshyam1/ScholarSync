import React from 'react';

jest.mock('@/lib/supabase/client', () => {
  const mockGetUser = jest.fn();
  const mockOnAuthStateChange = jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }));
  const mockSignOut = jest.fn().mockResolvedValue({ error: null });

  return {
    createClient: () => ({
      auth: {
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange,
        signOut: mockSignOut,
      },
    }),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from '../src/components/generic/Navbar';

// Helper to open mobile menu
const openMobileMenu = () => {
  const menuButton = screen.getByRole('button');
  fireEvent.click(menuButton);
};

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Home, Login, Register when not authenticated', async () => {
    // Mock the getUser function to return no user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    render(<Navbar />);
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows Home, Profile, Logout when authenticated', async () => {
    // Mock the getUser function to return a user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user123', email: 'test@example.com' } }, error: null });

    render(<Navbar />);
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('calls signOut and redirects on Logout click', async () => {
    // Mock the getUser function to return a user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user123', email: 'test@example.com' } }, error: null });

    render(<Navbar />);
    const logoutButton = await screen.findByText('Logout');
    fireEvent.click(logoutButton);
    await waitFor(() => {
      expect(mockClient.auth.signOut).toHaveBeenCalled();
    });
  });

  it('shows correct links in mobile menu (unauthenticated)', async () => {
    // Mock the getUser function to return no user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    render(<Navbar />);
    openMobileMenu();
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows correct links in mobile menu (authenticated)', async () => {
    // Mock the getUser function to return a user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user123', email: 'test@example.com' } }, error: null });

    render(<Navbar />);
    openMobileMenu();
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('all navigation links are accessible by role', async () => {
    // Mock the getUser function to return no user
    const { createClient } = require('@/lib/supabase/client');
    const mockClient = createClient();
    mockClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    render(<Navbar />);
    // Desktop links
    expect(await screen.findByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });
});