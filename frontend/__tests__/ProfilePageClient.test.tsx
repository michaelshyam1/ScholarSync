import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePageClient from '../src/app/(protected)/profile/ProfilePageClient';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/Profile';

const mockUser: User = {
  id: 'user-1',
  email: 'john@example.com',
  // add other required User fields as needed
} as User;

const mockProfile: Profile = {
  full_name: 'John Doe',
  // add other required Profile fields as needed
} as Profile;

describe('ProfilePageClient', () => {
  it('renders user profile', () => {
    render(<ProfilePageClient user={mockUser} initialProfile={mockProfile} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles missing profile fields gracefully', () => {
    render(<ProfilePageClient user={mockUser} initialProfile={{} as Profile} />);
    // Should not throw or crash, may render fallback UI
  });

  it('handles missing user email gracefully', () => {
    render(<ProfilePageClient user={{ id: 'user-1' } as User} initialProfile={mockProfile} />);
    // Should not throw or crash, may render fallback UI
  });
}); 