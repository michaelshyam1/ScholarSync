import { getAllScholarships } from '@/actions/scholarships/ListScholarships';
import ScholarshipsClient from './ScholarshipsClient';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ScholarshipsPage() {
  const supabase = createClient();
  const { data } = await (await supabase).auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all available scholarships from Supabase PostgreSQL
  const scholarships = await getAllScholarships();

  return <ScholarshipsClient scholarships={scholarships} />;
}