'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Application } from '@/types/Application';

interface Scholarship {
  id: string;
  scholarship_name: string;
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [scholarships, setScholarships] = useState<Record<string, Scholarship>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("User:", user, "UserError:", userError);

        if (userError || !user) {
          console.error("User not found:", userError);
          alert("User not found: " + JSON.stringify(userError, null, 2));
          setLoading(false);
          return;
        }

        // Fetch user's applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id);

        if (applicationsError) {
          console.error('Failed to fetch applications:', applicationsError);
          alert('Failed to fetch applications: ' + JSON.stringify(applicationsError, null, 2));
          setLoading(false);
          return;
        }

        setApplications(applicationsData || []);

        // Fetch scholarship details for all applications
        if (applicationsData && applicationsData.length > 0) {
          const scholarshipIds = applicationsData.map(app => app.scholarship_id);
          const { data: scholarshipsData, error: scholarshipsError } = await supabase
            .from('scholarships')
            .select('id, scholarship_name')
            .in('id', scholarshipIds);

          if (!scholarshipsError && scholarshipsData) {
            const scholarshipsMap = scholarshipsData.reduce((acc, scholarship) => {
              acc[scholarship.id] = scholarship;
              return acc;
            }, {} as Record<string, Scholarship>);
            setScholarships(scholarshipsMap);
          }
        } else {
          setScholarships({});
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        alert('Unexpected error: ' + JSON.stringify(error, null, 2));
      }
      setLoading(false);
    };

    fetchApplications();
  }, [supabase]);

  if (loading) {
    return (
      <main className="p-6 font-serif text-[#3d3d3d]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b3fa0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 font-serif text-[#3d3d3d]">
      <h1 className="text-2xl font-bold text-[#6b3fa0] mb-6">📌 Application Tracker</h1>
      <p className="mb-4 text-gray-600">Track and resume your scholarship applications below.</p>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't started any applications yet.</p>
          <Link
            href="/scholarships"
            className="inline-block text-white bg-[#6b3fa0] px-6 py-3 rounded hover:bg-[#4b277c]"
          >
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const scholarship = scholarships[app.scholarship_id];
            const isCompleted = app.status === 'submitted';
            const isDraft = app.status === 'draft';

            return (
              <div key={app.id} className="bg-white p-6 shadow rounded border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold text-[#6b3fa0]">
                    {scholarship?.scholarship_name || `Scholarship ${app.scholarship_id.slice(0, 8)}...`}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {isCompleted ? 'Submitted' : 'Draft'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Last updated: {new Date(app.updated_at || app.submitted_at || '').toLocaleDateString()}</p>
                  {app.submitted_at && (
                    <p>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  {isDraft && (
                    <Link
                      href={`/apply/${app.scholarship_id}`}
                      className="inline-block text-sm text-white bg-[#6b3fa0] px-4 py-2 rounded hover:bg-[#4b277c]"
                    >
                      Continue Application
                    </Link>
                  )}

                  {isCompleted && (
                    <Link
                      href={`/apply/${app.scholarship_id}`}
                      className="inline-block text-sm text-[#6b3fa0] border border-[#6b3fa0] px-4 py-2 rounded hover:bg-[#6b3fa0] hover:text-white"
                    >
                      View Application
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}





/* 'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Application {
  id: string;
  scholarship_id: string;
  status: string;
  created_at: string;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const {
        data,
        error
      } = await supabase.from('ScholarshipApplication').select('*').order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch:', error.message);
      } else {
        setApplications(data);
      }
    };

    fetchApplications();
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#6b3fa0] mb-6">📋 My Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-600">You haven't started or submitted any applications yet.</p>
      ) : (
        <ul className="space-y-4">
          {applications.map(app => (
            <li key={app.id} className="border rounded-md p-4 bg-white shadow-sm">
              <p><strong>Scholarship ID:</strong> {app.scholarship_id}</p>
              <p><strong>Status:</strong> {app.status}</p>
              <p><strong>Created At:</strong> {new Date(app.created_at).toLocaleString()}</p>

              {app.status === 'incomplete' && (
                <Link
                  href={`/apply/${app.scholarship_id}`}
                  className="inline-block mt-2 px-4 py-2 bg-[#6b3fa0] text-white rounded hover:bg-[#4b277c]"
                >
                  Continue
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
} */
