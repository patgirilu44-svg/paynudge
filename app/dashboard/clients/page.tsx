import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Clients",
};

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  created_at: string;
  user_id: string;
}

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, email, company, phone, created_at, user_id")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Clients fetch error:", error);
    return (
      <div className="card p-12 text-center">
        <p className="text-red-600">Failed to load clients. Please refresh the page.</p>
      </div>
    );
  }

  const clientList = (clients ?? []) as Client[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
          <p className="text-muted text-sm mt-1">{clientList.length} total clients</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary">
          + Add Client
        </Link>
      </div>

      {clientList.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No clients yet</h3>
          <p className="text-xs text-muted mb-4">Add your first client to get started</p>
          <Link href="/dashboard/clients/new" className="btn-primary">
            Add your first client
          </Link>
        </div>
      )}

      {clientList.length > 0 && (
        <div className="card divide-y divide-border">
          {clientList.map((client) => (
            <div key={client.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                  <span className="text-accent font-semibold text-sm">
                    {client.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{client.name}</p>
                  <p className="text-xs text-muted">{client.email}</p>
                  {client.company && <p className="text-xs text-muted">{client.company}</p>}
                </div>
              </div>
              <Link
                href={`/dashboard/invoices?client=${client.id}`}
                className="text-xs text-accent hover:underline font-medium"
              >
                View invoices →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}