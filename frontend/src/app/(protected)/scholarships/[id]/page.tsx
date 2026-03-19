export const dynamic = "force-dynamic";

import { getScholarshipDetails } from "@/actions/scholarships/GetScholarshipDetails";
import { redirect } from "next/navigation";
import SingleScholarshipPage from "@/components/scholarships/SingleScholarshipPage";
import { Scholarship } from "@/types/Scholarship";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarship: Scholarship | null = await getScholarshipDetails(id);
  if (!scholarship) {
    redirect("/scholarships");
  }
  return <SingleScholarshipPage scholarship={scholarship} />;
}