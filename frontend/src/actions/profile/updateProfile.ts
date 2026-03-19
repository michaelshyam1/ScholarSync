// src/app/actions/updateProfile.ts

"use server";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/Profile";
import { getRecommendedScholarships } from "@/actions/scholarships/GetRecommendedScholarships";
import { Scholarship } from "@/types/Scholarship";

type UpdateProfileParams = Profile & { userId: string };

export async function updateProfile({
  userId,
  ...fields
}: UpdateProfileParams) {
  const cleanedFields: Record<string, unknown> = {};
  Object.keys(fields).forEach((key) => {
    const typedKey = key as keyof Profile;
    const value = fields[typedKey];
    if ((typeof value === "string" || Array.isArray(value)) && value === "") {
      cleanedFields[typedKey] = null;
    } else {
      cleanedFields[typedKey] = value;
    }
  });

  const supabase = createClient();
  const { error } = await (await supabase)
    .from("profiles")
    .update(cleanedFields)
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // Fetch the updated profile
  const { data: updatedProfile, error: fetchError } = await (await supabase)
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  // Get recommendations and update the recommendations field
  const recommendations = await getRecommendedScholarships(updatedProfile);
  const recommendationIds = recommendations.map((s: Scholarship) => s.id);
  const { error: recError } = await (await supabase)
    .from("profiles")
    .update({ recommendations: recommendationIds })
    .eq("id", userId);
  if (recError) throw new Error(recError.message);

  return { success: true };
}
