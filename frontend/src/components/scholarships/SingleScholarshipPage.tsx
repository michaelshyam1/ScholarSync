import { Scholarship } from "@/types/Scholarship";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface SingleScholarshipPageProps {
  scholarship: Scholarship;
}

export default function SingleScholarshipPage({ scholarship }: SingleScholarshipPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center justify-center py-10 px-2">
      {/* Breadcrumbs */}
      <div className="w-full max-w-2xl mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/scholarships">Scholarships</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{scholarship.scholarship_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Back Button */}
      <div className="w-full max-w-2xl mb-4">
        <Button asChild variant="outline">
          <Link href="/scholarships">Back to Scholarships</Link>
        </Button>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 relative">
        {scholarship.recommended && (
          <Badge className="absolute top-6 right-6 bg-yellow-400 text-black font-semibold">
            AI Recommended
          </Badge>
        )}
        {scholarship.scholarship_image && (
          <div className="mb-6 flex justify-center">
            <Image
              src={scholarship.scholarship_image}
              alt={scholarship.scholarship_name}
              width={400}
              height={180}
              className="rounded-lg object-cover max-h-48 w-auto shadow"
            />
          </div>
        )}
        <h1 className="text-4xl font-extrabold mb-2 text-center text-primary">
          {scholarship.scholarship_name}
        </h1>
        {scholarship.scholarship_description && (
          <p className="mb-6 text-lg text-gray-700 text-center">
            {scholarship.scholarship_description}
          </p>
        )}
        {scholarship.tags && scholarship.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {scholarship.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {scholarship.scholarship_url && (
          <div className="flex justify-center mt-6">
            <Link href={`${scholarship.scholarship_url}`}>
              <Button size="lg" className="px-8 py-2 text-lg font-bold">
                View Website (More Details)
              </Button>
            </Link>
          </div>
        )}

        {scholarship.id && (
          <div className="flex justify-center mt-6">
            <Link href={`/apply/${scholarship.id}`}>
              <Button size="lg" className="px-8 py-2 text-lg font-bold">
                Apply Now
              </Button>
            </Link>
          </div>
        )}
        <div className="mt-8 text-xs text-gray-400 text-center">
          {scholarship.created_at && (
            <span className="mr-2">
              Created: {new Date(scholarship.created_at).toLocaleString()}
            </span>
          )}
          {scholarship.updated_at && (
            <span>
              Updated: {new Date(scholarship.updated_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}