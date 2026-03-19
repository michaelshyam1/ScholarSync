import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Query 1 - Getting Current User Information and Profile Information
export async function getCurrentUserWithProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }
  if (profile) {
    console.log("Profile fetched successfully:", profile);
  }
  return { user, profile };
}
