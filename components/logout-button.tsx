"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm("Are you sure you want to sign out?")) return;

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign out
    </button>
  );
}
