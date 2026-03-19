import React from 'react';

// Mock functions
const mockSignInWithPassword = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../src/components/auth/LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows loading state on submit', async () => {
    // Mock signInWithPassword to succeed
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(mockSignInWithPassword).toHaveBeenCalled());
  });

  it('shows error if login fails', async () => {
    // Mock signInWithPassword to fail with an Error object that has a message
    mockSignInWithPassword.mockResolvedValue({
      error: new Error('Invalid credentials')
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  it('redirects to /profile on successful login', async () => {
    // Mock signInWithPassword to succeed
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockSignInWithPassword).toHaveBeenCalled());
  });
}); 