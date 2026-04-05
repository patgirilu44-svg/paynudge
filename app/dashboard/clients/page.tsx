import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Clients — PayNudge",
};

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  created_at: string;
}

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, email, company, phone, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Clients fetch error:", error);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600 font-medium">Failed to load clients.</p>
          <p className="text-xs text-red-400 mt-1">Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const clientList = (clients ?? []) as Client[];

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {clientList.length === 0
              ? "No clients yet"
              : `${clientList.length} client${clientList.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add client
        </Link>
      </div>

      {/* Empty State */}
      {clientList.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-16 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Add your first client</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Start by adding a client — then create invoices and send payment nudges.
          </p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add client
          </Link>
        </div>
      )}

      {/* Client List */}
      {clientList.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {clientList.map((client, index) => (
            <div
              key={client.id}
              className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${
                index !== clientList.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">
                    {client.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                  <p className="text-xs text-gray-400 truncate">{client.email}</p>
                  {client.company && (
                    <p className="text-xs text-gray-400 truncate">{client.company}</p>
                  )}
                </div>
              </div>

              {/* Action */}
              <Link
                href={`/dashboard/invoices?client=${client.id}`}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 ml-4"
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