import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: summary, error: summaryError } = await supabase
    .from("dashboard_summary")
    .select("*")
    .single();

  if (summaryError) {
    console.error("Dashboard summary error:", summaryError);
  }

  const stats = [
    { label: "Total Clients", value: summary?.total_clients ?? 0, color: "text-foreground" },
    { label: "Pending Invoices", value: summary?.pending_invoices ?? 0, color: "text-warning" },
    { label: "Overdue Invoices", value: summary?.overdue_invoices ?? 0, color: "text-danger" },
    { label: "Paid This Month", value: summary?.paid_this_month ?? 0, color: "text-success" },
  ];

  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Hey, {name} 👋</h1>
        <p className="text-muted text-sm mt-1">
          Here&apos;s what&apos;s happening with your invoices.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs text-muted mb-1">{stat.label}</p>
            <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <Link href="/dashboard/clients" className="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Add Client</p>
              <p className="text-xs text-muted">Add a new client</p>
            </div>
          </Link>

          <Link href="/dashboard/invoices" className="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Add Invoice</p>
              <p className="text-xs text-muted">Create a new invoice</p>
            </div>
          </Link>

          <Link href="/dashboard/invoices?filter=overdue" className="card p-4 hover:shadow-md transition-shadow flex items-center gap-3">
            <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Send Nudge</p>
              <p className="text-xs text-muted">Follow up on overdue</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
            }
