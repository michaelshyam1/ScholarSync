"use client";

import { useState } from "react";
import ProfileForm from "@/components/profile/ProfileForm";
import { Profile } from "@/types/Profile";
import ProfileCard from "@/components/profile/ProfileCard";
import type { User } from '@supabase/supabase-js';

export default function ProfilePageClient({ user, initialProfile }: { user: User, initialProfile: Profile }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-0 md:p-8">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left: Portfolio Card */}
        <ProfileCard profile={profile} user={user} />
        {/* Right: Profile Edit Form */}
        <div className="flex-2 flex flex-col items-center justify-start gap-6">
          <ProfileForm
            user={user}
            profile={profile}
            setProfile={setProfile}
          />
        </div>
      </div>
    </div>
  );
}
