import React from 'react';

// SideNav.test.tsx
// Tests for the SideNav component
// - Renders navigation links
// - Highlights active link
// - Renders LogoutButton
// - Accessibility
// - Collapse/expand on hover

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: jest.fn(),
    },
  }),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import SideNav from '../src/components/generic/SideNav';

describe('SideNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Profile and Scholarships links when expanded', () => {
    // Mock usePathname to return /profile
    mockUsePathname.mockReturnValue('/profile');

    render(<SideNav />);
    const nav = screen.getByRole('navigation');
    fireEvent.mouseEnter(nav); // Expand sidebar
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Scholarships')).toBeInTheDocument();
  });

  it('highlights the active link when expanded', () => {
    // Mock usePathname to return /scholarships
    mockUsePathname.mockReturnValue('/scholarships');

    render(<SideNav />);
    const nav = screen.getByRole('navigation');
    fireEvent.mouseEnter(nav); // Expand sidebar
    const scholarshipsLink = screen.getByText('Scholarships');
    expect(scholarshipsLink.closest('a')?.className).toMatch(/bg-gray-200/);
    expect(scholarshipsLink.closest('a')?.className).toMatch(/font-semibold/);
  });

  it('renders the LogoutButton', () => {
    // Mock usePathname to return /profile
    mockUsePathname.mockReturnValue('/profile');

    render(<SideNav />);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('all navigation links are accessible by role when expanded', () => {
    // Mock usePathname to return /profile
    mockUsePathname.mockReturnValue('/profile');

    render(<SideNav />);
    const nav = screen.getByRole('navigation');
    fireEvent.mouseEnter(nav); // Expand sidebar
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /scholarships/i })).toBeInTheDocument();
  });

  it('expands on mouse enter and collapses on mouse leave', () => {
    // Mock usePathname to return /profile
    mockUsePathname.mockReturnValue('/profile');

    render(<SideNav />);
    const nav = screen.getByRole('navigation');
    // Initially collapsed: text labels should not be in the DOM
    expect(screen.queryByText('Profile')).toBeNull();
    expect(screen.queryByText('Scholarships')).toBeNull();
    // Mouse enter (expand): text labels should become visible
    fireEvent.mouseEnter(nav);
    expect(screen.getByText('Profile')).toBeVisible();
    expect(screen.getByText('Scholarships')).toBeVisible();
    // Mouse leave (collapse): text labels should not be in the DOM again
    fireEvent.mouseLeave(nav);
    expect(screen.queryByText('Profile')).toBeNull();
    expect(screen.queryByText('Scholarships')).toBeNull();
  });
}); 