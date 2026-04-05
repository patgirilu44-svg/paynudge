import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — PayNudge",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch real stats directly — no view dependency
  const [clientsRes, invoicesRes] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("invoices").select("id, status", { count: "exact" }).eq("user_id", user.id),
  ])

  const totalClients = clientsRes.count ?? 0
  const allInvoices = invoicesRes.data ?? []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const pendingCount = allInvoices.filter(i => i.status === 'pending').length
  const overdueCount = allInvoices.filter(i => i.status === 'overdue').length

  // Paid this month
  const { count: paidThisMonth } = await supabase
    .from("invoices")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .eq("status", "paid")
    .gte("updated_at", startOfMonth)

  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      color: "text-gray-900",
      bg: "bg-gray-50",
    },
    {
      label: "Pending",
      value: pendingCount,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Overdue",
      value: overdueCount,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Paid This Month",
      value: paidThisMonth ?? 0,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "there"

  const quickActions = [
    {
      href: "/dashboard/clients/new",
      title: "Add client",
      desc: "Add a new client to your list",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      ),
    },
    {
      href: "/dashboard/invoices",
      title: "New invoice",
      desc: "Create and track an invoice",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
    },
    {
      href: "/dashboard/invoices",
      title: "Send nudge",
      desc: "Follow up on overdue invoices",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      ),
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Hey, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Here&apos;s what&apos;s happening with your invoices.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-xs text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-700 font-medium">
            {overdueCount} invoice{overdueCount > 1 ? 's are' : ' is'} overdue
          </p>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-medium text-red-700 hover:text-red-800 underline underline-offset-2"
          >
            Review now →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <div className={`w-9 h-9 ${action.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <svg className={`w-5 h-5 ${action.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {action.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-400 truncate">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Empty state — new user */}
      {totalClients === 0 && allInvoices.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">Welcome to PayNudge!</p>
          <p className="text-sm text-gray-400 mb-5">
            Start by adding your first client, then create an invoice and send a payment nudge.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add your first client
          </Link>
        </div>
      )}

    </div>
  )
}