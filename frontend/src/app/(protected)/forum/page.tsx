import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/actions/profile/getProfile";
import {ForumClient} from "./ForumClient";
import { Profile } from "@/types/Profile";
import { redirect } from "next/navigation";

export default async function ForumPage() {
  const user = await getUser();
  if (!user) {
    return <div>Please log in to view the forum.</div>;
  }
  const profile: Profile | null = await getProfile(user.id);
  if (!profile) {
    redirect("/auth/login");
  }
  return <ForumClient user={profile} />;
}
