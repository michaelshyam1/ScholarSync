import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SideNav from "@/components/generic/SideNav"
import React from "react"
import type { ReactNode } from "react"

export const metadata = {
  title: "ScholarSync | Protected",
  description: "Protected area of ScholarSync",
}

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <SideNav />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
