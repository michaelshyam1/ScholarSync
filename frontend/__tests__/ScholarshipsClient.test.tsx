import { render, screen, waitFor } from '@testing-library/react';
import ScholarshipsClient from '@/app/(protected)/scholarships/ScholarshipsClient';
import * as supabaseQueries from '@/lib/supabase/queries';
import * as supabaseClient from '@/lib/supabase/client';
import React from 'react';

jest.mock('@/lib/supabase/queries');
jest.mock('@/lib/supabase/client');

const mockScholarships = [
  {
    id: '1',
    scholarship_name: 'Test Scholarship',
    scholarship_description: 'A test scholarship',
    scholarship_amount: 1000,
    scholarship_deadline: '2025-01-01',
    scholarship_url: 'https://example.com',
    scholarship_image: '',
    scholarship_status: 'active',
    scholarship_category: 'Test',
    scholarship_min_gpa: 3.0,
    scholarship_min_education_level: 'Bachelor',
    scholarship_country: 'USA',
    scholarship_gender_looking_for: 'Any',
    scholarship_max_age: 30,
    tags: ['test'],
    recommended: false,
    created_at: '',
    updated_at: '',
  },
];

describe('ScholarshipsClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', async () => {
    (supabaseQueries.getCurrentUserWithProfile as jest.Mock).mockResolvedValueOnce(null);
    render(<ScholarshipsClient scholarships={mockScholarships} />);
    expect(screen.getByText(/Loading recommendations/i)).toBeInTheDocument();
    await waitFor(() => { });
  });

  it('shows profile incomplete message', async () => {
    (supabaseQueries.getCurrentUserWithProfile as jest.Mock).mockResolvedValueOnce({ user: {}, profile: null });
    render(<ScholarshipsClient scholarships={mockScholarships} />);
    await waitFor(() => {
      expect(screen.getByText(/User has to ensure profile is filled fully to get recommendations/i)).toBeInTheDocument();
    });
  });

  it('shows no recommendations message', async () => {
    (supabaseQueries.getCurrentUserWithProfile as jest.Mock).mockResolvedValueOnce({ user: {}, profile: { recommendations: [] } });
    render(<ScholarshipsClient scholarships={mockScholarships} />);
    await waitFor(() => {
      expect(screen.getByText(/No recommendations available yet/i)).toBeInTheDocument();
    });
  });

  it('shows recommended scholarships', async () => {
    (supabaseQueries.getCurrentUserWithProfile as jest.Mock).mockResolvedValueOnce({ user: {}, profile: { recommendations: ['1'] } });
    (supabaseClient.createClient as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({ in: async () => ({ data: [mockScholarships[0]], error: null }) })
      })
    });
    render(<ScholarshipsClient scholarships={mockScholarships} />);
    await waitFor(() => {
      const allTitles = screen.getAllByText(/Test Scholarship/i);
      expect(allTitles.length).toBeGreaterThan(0);
    });
  });
}); 