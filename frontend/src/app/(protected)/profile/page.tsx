import { getProfile } from "@/actions/profile/getProfile";
import { createClient } from "@/lib/supabase/server";
import ProfilePageClient from "./ProfilePageClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data } = await (await supabase).auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);

  return <ProfilePageClient user={user} initialProfile={profile} />;
}
