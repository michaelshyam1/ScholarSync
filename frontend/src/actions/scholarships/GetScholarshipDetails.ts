"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Scholarship } from "@/types/Scholarship";

export async function getScholarshipDetails(
  id: string,
): Promise<Scholarship | null> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data, error } = await supabase
    .from("scholarships")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch scholarship details:", error);
    return null;
  }

  return data as Scholarship;
}
