'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ApplicationPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [languageList, setLanguageList] = useState([
    { language: '', spoken: '', written: '' },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const scholarshipId = params?.scholarshipId as string;

  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Step 1: Personal Particulars
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    email: '',
    dob: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    race: '',
    religion: '',
    address: '',
    altAddress: '',
  });

  // Step 2: Family Particulars (multiple entries)
  const [familyList, setFamilyList] = useState([
    {
      firstName: '',
      lastName: '',
      relationship: '',
      dob: '',
      gender: '',
      nationality: '',
      maritalStatus: '',
      race: '',
      occupation: '',
      workplace: '',
    },
  ]);

  // Step 3: GCE 'N'/'O' Level (Education)
  const [nLevelSubjects, setNLevelSubjects] = useState([{ subject: '', grade: '' }]);
  const [nLevelDetails, setNLevelDetails] = useState({
    course: '',
    institution: '',
    year: '',
    startDate: '',
    gradDate: '',
    country: '',
    stream: '',
    examYear: '',
  });

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not found:", userError);
          setIsLoading(false);
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setIsLoading(false);
          return;
        }

        if (profile) {
          // Parse full name into first and last name
          const nameParts = profile.full_name?.split(' ') || ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Update personal data with profile information
          setPersonalData(prev => ({
            ...prev,
            firstName,
            lastName,
            email: user.email || '',
            dob: profile.date_of_birth || '',
            gender: profile.gender || '',
            nationality: profile.nationality || '',
            maritalStatus: profile.marital_status || '',
            race: profile.race || '',
            // Note: contact, religion, address fields might not be in profile
          }));

          // Update education details if available
          if (profile.current_education) {
            setNLevelDetails(prev => ({
              ...prev,
              course: profile.current_education,
              country: profile.country || '',
            }));
          }

          // Update language proficiency if available
          if (profile.language_proficiency && profile.language_proficiency.length > 0) {
            const languageData = profile.language_proficiency.map((lang: string) => ({
              language: lang,
              spoken: 'Fluent', // Default values since profile doesn't have spoken/written
              written: 'Fluent',
            }));
            setLanguageList(languageData);
          }
        }

        // Check for existing application
        const { data: existingApplication, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarshipId)
          .single();

        if (!appError && existingApplication) {
          setApplicationId(existingApplication.id);

          // Load existing form data
          if (existingApplication.form_data) {
            const formData = existingApplication.form_data;

            if (formData.personal_data) {
              setPersonalData(formData.personal_data);
            }
            if (formData.family_details) {
              setFamilyList(formData.family_details);
            }
            if (formData.education_o) {
              setNLevelDetails(formData.education_o);
            }
            if (formData.language_prc) {
              setLanguageList(formData.language_prc);
            }
            if (formData.n_level_subjects) {
              setNLevelSubjects(formData.n_level_subjects);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [supabase, scholarshipId]);

  const addFamilyMember = () => {
    setFamilyList([
      ...familyList,
      {
        firstName: '',
        lastName: '',
        relationship: '',
        dob: '',
        gender: '',
        nationality: '',
        maritalStatus: '',
        race: '',
        occupation: '',
        workplace: '',
      },
    ]);
  };

  // Step 3: GCE 'N'/'O' Level (Education)
  const addNLevelSubject = () => {
    setNLevelSubjects([...nLevelSubjects, { subject: '', grade: '' }]);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const next = () => {
    setStep((s) => {
      const newStep = Math.min(s + 1, 6);
      return newStep;
    });
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found or error getting user:", userError);
        return;
      }

      console.log("Current user:", user.id);
      console.log("Scholarship ID:", scholarshipId);

      // First, let's test if we can access the applications table
      const { error: testError } = await supabase
        .from('applications')
        .select('id')
        .limit(1);

      if (testError) {
        console.error("Cannot access applications table:", testError);
        return;
      }

      console.log("Can access applications table successfully");

      // Check if the scholarship exists
      const { data: scholarship, error: scholarshipError } = await supabase
        .from('scholarships')
        .select('id')
        .eq('id', scholarshipId)
        .single();

      if (scholarshipError) {
        console.error("Scholarship not found:", scholarshipError);
        return;
      }

      console.log("Scholarship exists:", scholarship.id);

      // Prepare form data as JSONB
      const formData = {
        personal_data: personalData,
        family_details: familyList,
        education_o: nLevelDetails,
        education_a: {}, // A-level education (to be filled in steps 4-5)
        education_te: {}, // Tertiary education (to be filled in steps 4-5)
        language_prc: languageList,
        n_level_subjects: nLevelSubjects,
      };

      console.log("Form data to save:", formData);

      // Check if application already exists
      if (applicationId) {
        console.log("Updating existing application:", applicationId);
        // Update existing application
        const { error } = await supabase
          .from('applications')
          .update({
            form_data: formData,
            last_edited: new Date().toISOString(),
          })
          .eq('id', applicationId);

        if (error) {
          console.error('Failed to update draft - Full error:', error);
          console.error('Error details:', error.details, error.hint, error.code);
          toast.error('Failed to save application. Please try again.');
        } else {
          toast.success('Application saved successfully!');
          router.push('/apply');
        }
      } else {
        console.log("Creating new application");
        // Create new application
        const { data, error } = await supabase
          .from('applications')
          .insert([
            {
              user_id: user.id,
              scholarship_id: scholarshipId,
              form_data: formData,
              status: 'draft',
            },
          ])
          .select('id')
          .single();

        if (error) {
          console.error('Failed to save draft - Full error:', error);
          console.error('Error details:', error.details, error.hint, error.code);
          toast.error('Failed to save application. Please try again.');
        } else {
          console.log("Application created successfully:", data);
          setApplicationId(data.id);
          toast.success('Application saved successfully!');
          setTimeout(() => {
            window.location.href = '/apply';
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Unexpected error in handleSave:", error);
    }
  };

  const handleSubmit = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not found or error getting user:", userError);
      return;
    }

    // Prepare form data as JSONB
    const formData = {
      personal_data: personalData,
      family_details: familyList,
      education_o: nLevelDetails,
      education_a: {}, // A-level education (to be filled in steps 4-5)
      education_te: {}, // Tertiary education (to be filled in steps 4-5)
      language_prc: languageList,
      n_level_subjects: nLevelSubjects,
    };

    // Check if application already exists
    if (applicationId) {
      // Update existing application to submitted status
      const { error } = await supabase
        .from('applications')
        .update({
          form_data: formData,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          last_edited: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Submission failed:', error.message);
        toast.error('Failed to submit application. Please try again.');
      } else {
        toast.success('Application submitted successfully!');
        setTimeout(() => {
          window.location.href = '/apply';
        }, 1500);
      }
    } else {
      // Create new application with submitted status
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            user_id: user.id,
            scholarship_id: scholarshipId,
            form_data: formData,
            status: 'submitted',
          },
        ]);

      if (error) {
        console.error('Submission failed:', error.message);
        toast.error('Failed to submit application. Please try again.');
      } else {
        toast.success('Application submitted successfully!');
        setTimeout(() => {
          window.location.href = '/apply';
        }, 1500);
      }
    }
  };

  return (
    <main className="w-full font-serif text-[#3d3d3d]">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b3fa0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 pt-8">
            <h2 className="text-[#6b3fa0] font-bold text-md uppercase mb-2">
              Step {step} out of 6
            </h2>
            <div className="bg-[#fceec9] w-full h-3 rounded relative">
              <div
                className="bg-[#6b3fa0] h-full rounded transition-all"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Personal Particulars */}
          {step === 1 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Personal Particulars
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder="First Name"
                  value={personalData.firstName}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Last Name"
                  value={personalData.lastName}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Contact no."
                  value={personalData.contact}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, contact: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Email Address"
                  value={personalData.email}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Date of Birth"
                  value={personalData.dob}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, dob: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Gender"
                  value={personalData.gender}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, gender: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Nationality"
                  value={personalData.nationality}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, nationality: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Marital Status"
                  value={personalData.maritalStatus}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Race"
                  value={personalData.race}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, race: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Religion"
                  value={personalData.religion}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, religion: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Address"
                  value={personalData.address}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full col-span-2"
                />
                <input
                  placeholder="Alternative Address"
                  value={personalData.altAddress}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, altAddress: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full col-span-2"
                />
              </div>
              <div className="mt-8 flex justify-end gap-4 flex-wrap">
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={next}
                  className="bg-[#6b3fa0] hover:bg-[#4b277c] text-white font-bold px-6 py-2 rounded"
                >
                  NEXT
                </button>
              </div>
            </section>
          )}

          {/* Step 2: Family Particulars */}
          {step === 2 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Family Particulars
              </h3>

              {familyList.map((member, index) => (
                <div key={index} className="mb-8 border-b border-gray-300 pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="First Name" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Last Name" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Relationship" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Date of Birth" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Gender" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Nationality" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Marital Status" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Race" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Occupation" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                    <input placeholder="Name of Workplace" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                  </div>
                </div>
              ))}

              <button
                onClick={addFamilyMember}
                className="text-sm text-[#6b3fa0] flex items-center gap-1 mt-2 hover:underline"
              >
                ➕ Add Another
              </button>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={back}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded"
                >
                  BACK
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={next}
                  className="bg-[#6b3fa0] hover:bg-[#4b277c] text-white font-bold px-6 py-2 rounded"
                >
                  NEXT
                </button>
              </div>
            </section>
          )}

          {/* Step 3: N-Level/O-Level Education */}
          {step === 3 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Education Details (GCE 'N'/'O' Level or Equivalent)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Course of Study"
                  value={nLevelDetails.course}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, course: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Name of Institution"
                  value={nLevelDetails.institution}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, institution: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Current Year"
                  value={nLevelDetails.year}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, year: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Start Date"
                  value={nLevelDetails.startDate}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Graduation Date"
                  value={nLevelDetails.gradDate}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, gradDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Country"
                  value={nLevelDetails.country}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, country: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Stream"
                  value={nLevelDetails.stream}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, stream: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
                <input
                  placeholder="Year of Exam"
                  value={nLevelDetails.examYear}
                  onChange={(e) => setNLevelDetails(prev => ({ ...prev, examYear: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {nLevelSubjects.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <input
                      placeholder="Subject Taken"
                      value={item.subject}
                      onChange={(e) => {
                        const updatedSubjects = [...nLevelSubjects];
                        updatedSubjects[i].subject = e.target.value;
                        setNLevelSubjects(updatedSubjects);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                    />
                    <input
                      placeholder="Result Grade"
                      value={item.grade}
                      onChange={(e) => {
                        const updatedSubjects = [...nLevelSubjects];
                        updatedSubjects[i].grade = e.target.value;
                        setNLevelSubjects(updatedSubjects);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addNLevelSubject}
                className="text-sm text-[#6b3fa0] flex items-center gap-1 mt-2 hover:underline"
              >
                ➕ Add Another
              </button>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={back}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded"
                >
                  BACK
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={next}
                  className="bg-[#6b3fa0] hover:bg-[#4b277c] text-white font-bold px-6 py-2 rounded"
                >
                  NEXT
                </button>
              </div>
            </section>
          )}

          {/* Step 4: GCE 'A' / IB / NITEC / Poly Diploma */}
          {step === 4 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Education Details (A-Level / IB / NITEC / Poly Diploma)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input placeholder="Course of Study" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Name of Institution" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Current Year" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Start Date" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Graduation Date" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Country" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input placeholder="Exam Type (e.g. A-Level, IB)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Exam Year" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
              </div>

              {/* Add subject-grade pairs manually if needed later */}

              <div className="mt-8 flex justify-between">
                <button
                  onClick={back}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded"
                >
                  BACK
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={next}
                  className="bg-[#6b3fa0] hover:bg-[#4b277c] text-white font-bold px-6 py-2 rounded"
                >
                  NEXT
                </button>
              </div>
            </section>
          )}

          {/* Step 5: Tertiary Education */}
          {step === 5 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Education Details (Tertiary)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input placeholder="Course of Study" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Name of Institution" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Start Date" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Expected Graduation Date" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Country" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
                <input placeholder="Type of Degree (e.g. BSc, BA)" className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full" />
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={back}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded"
                >
                  BACK
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={next}
                  className="bg-[#6b3fa0] hover:bg-[#4b277c] text-white font-bold px-6 py-2 rounded"
                >
                  NEXT
                </button>
              </div>
            </section>
          )}

          {/* Step 6: Language Proficiency */}
          {step === 6 && (
            <section className="p-6 sm:p-10 max-w-6xl mx-auto">
              <h3 className="bg-[#fceec9] px-4 py-2 inline-block font-bold text-lg mb-6 rounded">
                Language Proficiency
              </h3>

              {languageList.map((lang, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <input
                    placeholder="Language"
                    value={lang.language}
                    onChange={(e) => {
                      const updatedList = [...languageList];
                      updatedList[index].language = e.target.value;
                      setLanguageList(updatedList);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                  />
                  <input
                    placeholder="Spoken Proficiency (e.g. Basic, Fluent)"
                    value={lang.spoken}
                    onChange={(e) => {
                      const updatedList = [...languageList];
                      updatedList[index].spoken = e.target.value;
                      setLanguageList(updatedList);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                  />
                  <input
                    placeholder="Written Proficiency (e.g. Basic, Fluent)"
                    value={lang.written}
                    onChange={(e) => {
                      const updatedList = [...languageList];
                      updatedList[index].written = e.target.value;
                      setLanguageList(updatedList);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm w-full"
                  />
                </div>
              ))}

              <button
                onClick={() =>
                  setLanguageList([
                    ...languageList,
                    { language: '', spoken: '', written: '' },
                  ])
                }
                className="text-sm text-[#6b3fa0] flex items-center gap-1 mt-2 hover:underline"
              >
                ➕ Add Another
              </button>

              <div className="mt-8 flex justify-between gap-2">
                <button
                  onClick={back}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-6 py-2 rounded"
                >
                  BACK
                </button>
                <button
                  onClick={handleSave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded mr-2"
                >
                  Save & Continue Later
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded"
                >
                  Submit Application
                </button>
              </div>

            </section>
          )}

        </>
      )}
    </main>
  );
}
