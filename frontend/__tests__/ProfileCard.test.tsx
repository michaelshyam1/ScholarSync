import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileCard from '../src/components/profile/ProfileCard';
import type { Profile } from '@/types/Profile';
import type { User } from '@supabase/supabase-js';

const baseProfile: Profile = {
  full_name: 'John Doe',
  date_of_birth: '2000-01-01',
  gender: 'Male',
  nationality: 'Singaporean',
  marital_status: 'Single',
  race: 'Asian',
  current_education: 'University',
  preferred_industries: ['Tech', 'Finance'],
  language_proficiency: ['English', 'Mandarin'],
  technical_skills: ['React', 'TypeScript'],
  id: ''
};

const baseUser: User = {
  id: 'user-123',
  email: 'john@example.com',
  // ...add other required User fields as needed for your type
} as User;

describe('ProfileCard', () => {
  it('renders user full name and email', () => {
    render(<ProfileCard profile={baseProfile} user={baseUser} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(1);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders all visible profile fields except hidden ones', () => {
    render(<ProfileCard profile={baseProfile} user={baseUser} />);
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByText('2000-01-01')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.queryByText('id')).not.toBeInTheDocument();
    expect(screen.queryByText('avatar_url')).not.toBeInTheDocument();
  });

  it('handles missing profile fields gracefully', () => {
    const partialProfile = { full_name: 'Jane Doe' } as Profile;
    render(<ProfileCard profile={partialProfile} user={baseUser} />);
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    // Should not throw or crash
  });

  it('handles empty profile gracefully', () => {
    render(<ProfileCard profile={{} as Profile} user={baseUser} />);
    // Should not throw or crash
  });

  it('handles missing user email gracefully', () => {
    render(<ProfileCard profile={baseProfile} user={{} as User} />);
    // Should not throw or crash
  });
}); 