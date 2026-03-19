import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from '../src/components/profile/ProfileForm';
import type { Profile } from '@/types/Profile';
import type { User } from '@supabase/supabase-js';
import { updateProfile } from '@/actions/profile/updateProfile';

// Mock the updateProfile action
jest.mock('@/actions/profile/updateProfile', () => ({
  updateProfile: jest.fn().mockResolvedValue({}),
}));

const baseProfile: Profile = {
  full_name: 'John Doe',
  date_of_birth: '2000-01-01',
  gender: 'Male',
  nationality: 'singaporean',
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
} as User;

describe('ProfileForm', () => {
  it('renders all required fields for the first step', () => {
    render(<ProfileForm user={baseUser} profile={baseProfile} />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nationality/i)).toBeInTheDocument();
  });

  it('shows initial values', () => {
    render(<ProfileForm user={baseUser} profile={baseProfile} />);
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Male')).toBeInTheDocument();
    const nationalitySelect = screen.getByLabelText(/Nationality/i) as HTMLSelectElement;
    expect(
      Array.from(nationalitySelect.options).find(option => option.selected)?.value
    ).toBe('singaporean');
  });

  it('navigates to next and previous steps', () => {
    render(<ProfileForm user={baseUser} profile={baseProfile} />);
    // Go to next step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Check for the heading
    expect(screen.getByRole('heading', { name: /Preferred Industries/i })).toBeInTheDocument();
    // Go back
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });

  it('calls updateProfile on submit', async () => {
    render(<ProfileForm user={baseUser} profile={baseProfile} />);
    // Go to last step
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
    });
  });

  it('disables save button while saving', async () => {
    // Make updateProfile take some time
    (updateProfile as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 100)));
    render(<ProfileForm user={baseUser} profile={baseProfile} />);
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    // Wait for save to finish
    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
  });

  // Add more tests for validation and error handling as needed
});
