import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScholarshipCard } from '../src/components/scholarships/ScholarshipCard';
import type { Scholarship } from '@/types/Scholarship';

const baseScholarship: Scholarship = {
  id: 'sch-1',
  scholarship_name: 'AI Scholarship',
  scholarship_amount: 1000,
  scholarship_category: 'AI',
  scholarship_deadline: '2024-12-31',
  scholarship_description: 'A scholarship for AI students.',
  scholarship_url: 'https://example.com/apply',
  scholarship_image: '',
  recommended: true,
  tags: ['AI', 'ML'],
};

describe('ScholarshipCard', () => {
  it('renders scholarship name and category', () => {
    render(<ScholarshipCard scholarship={baseScholarship} />);
    expect(screen.getByText('AI Scholarship')).toBeInTheDocument();
    expect(screen.getAllByText('AI').length).toBeGreaterThanOrEqual(1);
  });

  it('shows N/A for missing deadline', () => {
    const scholarship = { ...baseScholarship, scholarship_deadline: undefined };
    render(<ScholarshipCard scholarship={scholarship} />);
    expect(screen.getByText('Deadline: N/A')).toBeInTheDocument();
  });

  it('renders recommended badge if recommended', () => {
    render(<ScholarshipCard scholarship={baseScholarship} />);
    expect(screen.getByText(/AI Recommended/i)).toBeInTheDocument();
  });

  it('renders tags if present', () => {
    render(<ScholarshipCard scholarship={baseScholarship} />);
    expect(screen.getAllByText('AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ML')).toBeInTheDocument();
  });

  it('renders Apply and Details buttons as expected', () => {
    render(<ScholarshipCard scholarship={baseScholarship} showApplyButton showDetailsButton />);
    expect(screen.getByRole('link', { name: /apply/i })).toHaveAttribute('href', `/apply/${baseScholarship.id}`);
    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute('href', `/scholarships/${baseScholarship.id}`);
  });

  it('disables Apply button if scholarship_url is missing', () => {
    const scholarship = { ...baseScholarship, scholarship_url: undefined };
    render(<ScholarshipCard scholarship={scholarship} />);
    const applyLink = screen.getByRole('link', { name: /apply/i });
    expect(applyLink).toHaveAttribute('href', `/apply/${scholarship.id}`);
  });
}); 