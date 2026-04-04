import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard-nav";
import LogoutButton from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-page">
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-surface border-r border-border flex-col z-10">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-base font-semibold text-foreground">PayNudge</span>
          </div>
        </div>

        <DashboardNav />

        <div className="px-3 py-4 border-t border-border">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-muted truncate">{user?.email ?? "User"}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="md:ml-56 min-h-screen p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
