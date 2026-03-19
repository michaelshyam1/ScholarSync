"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Scholarship } from "@/types/Scholarship";

export async function listScholarships(
  skip = 0,
  limit?: number,
  getAll = false,
): Promise<Scholarship[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  let query = supabase
    .from("scholarships")
    .select("*")
    .order("created_at", { ascending: false });

  // If getAll is true, return all scholarships without pagination
  if (getAll) {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Otherwise, use pagination
  if (limit) {
    query = query.range(skip, skip + limit - 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

// Function to get all scholarships without pagination
export async function getAllScholarships(): Promise<Scholarship[]> {
  return listScholarships(0, undefined, true);
}

// Function to get scholarships with filters
export async function getFilteredScholarships(
  filters: {
    country?: string;
    status?: string;
    category?: string;
    gender?: string;
  } = {},
): Promise<Scholarship[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  let query = supabase
    .from("scholarships")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.country) {
    query = query.eq("scholarship_country", filters.country);
  }
  if (filters.status) {
    query = query.eq("scholarship_status", filters.status);
  }
  if (filters.category) {
    query = query.contains("scholarship_category", [filters.category]);
  }
  if (filters.gender) {
    query = query.eq("scholarship_gender_looking_for", filters.gender);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

// Function to get total count of scholarships
export async function getScholarshipsCount(): Promise<number> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { count, error } = await supabase
    .from("scholarships")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count || 0;
}
