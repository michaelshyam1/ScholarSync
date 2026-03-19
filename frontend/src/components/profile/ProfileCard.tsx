import { Card, CardContent } from "@/components/ui/card";
import { User as UserIcon, Mail, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/types/Profile";
import type { User } from '@supabase/supabase-js';

const PROFILE_LABELS: Record<string, string> = {
  full_name: "Name",
  email: "Email",
  date_of_birth: "Date of Birth",
  gender: "Gender",
  nationality: "Nationality",
  marital_status: "Marital Status",
  race: "Race",
  current_education: "Current Education",
  preferred_industries: "Preferred Industries",
  language_proficiency: "Language Proficiency",
  technical_skills: "Technical Skills",
};

const HIDDEN_FIELDS = [
  "id", "avatar_url", "role", "last_login_at", "created_at", "updated_at", "application_data", "recommendations"
];

export default function ProfileCard({ profile, user }: { profile: Profile, user: User }) {
  return (
    <Card className="w-full max-w-md rounded-2xl p-10 shadow-xl border-2 border-primary/20 bg-white">
      <div className="flex flex-col items-center text-center space-y-4 mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30 shadow">
          <UserIcon className="w-12 h-12 text-primary" />
        </div>
        <div className="text-2xl font-bold flex items-center gap-2">
          {profile?.full_name}
        </div>
        <Badge variant="secondary">Student</Badge>
        <div className="flex items-center gap-2 text-gray-500">
          <Mail className="w-4 h-4" />
          <span>{user?.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>SINGAPORE</span>
        </div>
      </div>
      <CardContent className="space-y-4 text-sm text-left">
        <div className="flex flex-col gap-2">
          {profile &&
            Object.entries(profile)
              .filter(([key, value]) =>
                !HIDDEN_FIELDS.includes(key) &&
                value &&
                (Array.isArray(value) ? value.length > 0 : true)
              )
              .map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500">
                    {PROFILE_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {Array.isArray(value)
                      ? value.join(", ")
                      : typeof value === "string" || typeof value === "number"
                        ? value
                        : ""
                    }
                  </span>
                </div>
              ))
          }
        </div>
      </CardContent>
    </Card>
  );
}