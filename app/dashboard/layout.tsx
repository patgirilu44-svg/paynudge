import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardNav from "@/components/dashboard-nav"
import LogoutButton from "@/components/logout-button"
import MobileSidebar from "@/components/mobile-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex-col z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-base font-semibold text-gray-900">PayNudge</span>
          </div>
        </div>
        <DashboardNav />
        <div className="px-3 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 px-3 mb-2 truncate">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="text-base font-semibold text-gray-900">PayNudge</span>
        </div>
        <MobileSidebar email={user.email ?? ''} />
      </header>

      {/* Main — pt-14 for mobile header height */}
      <main className="md:ml-56 min-h-screen p-4 md:p-8 pt-[3.75rem] md:pt-8">
        {children}
      </main>

    </div>
  )
}