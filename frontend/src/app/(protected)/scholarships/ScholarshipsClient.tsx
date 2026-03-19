"use client"

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GraduationCap, Star, List, LayoutGrid, Database } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import type { Scholarship } from '@/types/Scholarship';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import { getCurrentUserWithProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/client";

const SORT_OPTIONS = [
  { value: "amount_desc", label: "Amount (High to Low)" },
  { value: "amount_asc", label: "Amount (Low to High)" },
  { value: "deadline_asc", label: "Deadline (Soonest)" },
  { value: "deadline_desc", label: "Deadline (Latest)" },
  { value: "name_asc", label: "Name (A-Z)" },
];

const PAGE_SIZE = 12;

export default function ScholarshipsClient({ scholarships }: { scholarships: Scholarship[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("amount_desc");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'box' | 'list'>('box');
  const [recommended, setRecommended] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const uniqueTags = Array.from(
    new Set(scholarships.flatMap(s => s.tags ?? []).filter((t): t is string => !!t))
  );
  const [tag, setTag] = useState("all");

  useEffect(() => {
    async function fetchPersistedRecommendations() {
      setLoading(true);
      try {
        // Get current user and profile (client-side)
        const result = await getCurrentUserWithProfile();
        if (!result || !result.user || !result.profile) {
          setProfileIncomplete(true);
          setLoading(false);
          return;
        }
        const profile = result.profile;
        // Check for recommendations field
        if (!profile.recommendations || !Array.isArray(profile.recommendations) || profile.recommendations.length === 0) {
          setRecommended([]);
          setLoading(false);
          return;
        }
        // Fetch scholarships by IDs
        const supabase = createClient();
        const { data: recScholarships, error } = await supabase
          .from("scholarships")
          .select("*")
          .in("id", profile.recommendations);
        if (error) {
          setRecommended([]);
          setLoading(false);
          return;
        }
        setRecommended(recScholarships || []);
        setProfileIncomplete(false);
      } catch (err) {
        console.error(err);
        setProfileIncomplete(true);
      }
      setLoading(false);
    }
    fetchPersistedRecommendations();
  }, []);

  // Filtering
  let filtered = scholarships.filter(scholarship =>
    (scholarship.scholarship_name?.toLowerCase() ?? "").includes(search.toLowerCase()) &&
    (tag === "all" || (scholarship.tags?.includes(tag)))
  );

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sort === "amount_desc") {
      // Handle undefined amounts as 0
      const aAmount = a.scholarship_amount ?? 0;
      const bAmount = b.scholarship_amount ?? 0;
      return bAmount - aAmount;
    }
    if (sort === "amount_asc") {
      const aAmount = a.scholarship_amount ?? 0;
      const bAmount = b.scholarship_amount ?? 0;
      return aAmount - bAmount;
    }
    if (sort === "deadline_asc") {
      const aDeadline = a.scholarship_deadline ?? "";
      const bDeadline = b.scholarship_deadline ?? "";
      return aDeadline.localeCompare(bDeadline);
    }
    if (sort === "deadline_desc") {
      const aDeadline = a.scholarship_deadline ?? "";
      const bDeadline = b.scholarship_deadline ?? "";
      return bDeadline.localeCompare(aDeadline);
    }
    if (sort === "name_asc") {
      const aName = a.scholarship_name ?? "";
      const bName = b.scholarship_name ?? "";
      return aName.localeCompare(bName);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-0 md:p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 pt-8 pb-2">
          <GraduationCap className="text-primary size-8" />
          Scholarships
        </h1>

        {/* Total Count Display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/60 rounded-lg p-3">
          <Database className="size-4" />
          <span>Total Scholarships Available: <strong>{scholarships.length}</strong></span>
          {search && (
            <span>• Filtered Results: <strong>{filtered.length}</strong></span>
          )}
        </div>

        {/* Recommended Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-500 size-6" />
            <h2 className="text-2xl font-semibold">Scholarships Curated by our AI</h2>
          </div>
          {profileIncomplete ? (
            <div className="bg-yellow-100 text-blue-800 p-4 rounded mb-4">
              <span className="text-4xl mb-2">😕</span>
              User has to ensure profile is filled fully to get recommendations
            </div>
          ) : loading ? (
            <div>Loading recommendations...</div>
          ) : recommended.length === 0 ? (
            <div className="bg-blue-100 text-blue-800 p-4 rounded mb-4">
              <span className="text-4xl mb-2">😕</span>
              No recommendations available yet. Please update your profile to get personalized suggestions.
            </div>
          ) : (
            <div className={view === 'box' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {recommended.map(scholarship => (
                <ScholarshipCard
                  key={scholarship.id || scholarship.scholarship_name || Math.random()}
                  scholarship={scholarship}
                  showApplyButton={true}
                  showDetailsButton={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Search, Filter, Sort Section */}
        <div className="flex flex-col md:flex-row gap-4 bg-white/80 rounded-xl shadow p-4 md:p-6 border items-center justify-between">
          <Input placeholder='Enter scholarship name...' value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1' />
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {uniqueTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* View Toggle */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant={view === 'box' ? 'default' : 'outline'}
              size="icon"
              aria-label="Box view"
              onClick={() => setView('box')}
            >
              <LayoutGrid className="size-5" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              aria-label="List view"
              onClick={() => setView('list')}
            >
              <List className="size-5" />
            </Button>
          </div>
        </div>


        {/* All Scholarships */}
        <section>
          <div className="flex items-center gap-2 mb-4 mt-10">
            <h2 className="text-2xl font-semibold">All Available Scholarships</h2>
            <span className="text-sm text-muted-foreground">({filtered.length} of {scholarships.length})</span>
          </div>
          <div className={view === 'box' ? "overflow-auto max-h-[60vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2" : "overflow-auto max-h-[60vh] flex flex-col gap-4 px-2"}>
            {paginated.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                <span className="text-4xl mb-2">😕</span>
                <p>No scholarships found. Try adjusting your filters or search.</p>
              </div>
            ) : (
              paginated.map(scholarship => (
                <ScholarshipCard
                  key={scholarship.id || scholarship.scholarship_name || Math.random()}
                  scholarship={scholarship}
                  showApplyButton={true}
                  showDetailsButton={true}
                />
              ))
            )}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : 0}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={e => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    aria-disabled={page === totalPages}
                    tabIndex={page === totalPages ? -1 : 0}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </div>
    </div>
  )
}
