import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus, Search, Download, Settings, LayoutDashboard } from "lucide-react";
import { AdminActions } from "./AdminActions";

const TIER_BADGE: Record<string, string> = {
  free: "bg-warm-100 text-warm-600",
  advocacy: "bg-cannavec-100 text-cannavec-700",
  startup: "bg-blue-50 text-blue-700",
  professional: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { q?: string; tier?: string; status?: string; page?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();
  const page = parseInt(searchParams.page ?? "1", 10);
  const perPage = 25;
  const from = (page - 1) * perPage;

  let query = admin
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (searchParams.q) {
    query = query.or(
      `full_name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`
    );
  }
  if (searchParams.tier) query = query.eq("role", searchParams.tier);
  if (searchParams.status === "active") query = query.eq("is_active", true);
  if (searchParams.status === "suspended") query = query.eq("is_active", false);

  const { data: profiles, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / perPage);

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Admin top nav */}
      <header className="bg-cannavec-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-mono text-xs font-bold">cv</span>
            </div>
            <span className="font-display text-lg tracking-tight">cannavec</span>
            <span className="text-accent text-xs font-mono mt-0.5">.ai</span>
          </div>
          <span className="text-white/40 text-sm">/ Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-cannavec-900">Members</h1>
            <p className="text-warm-500 text-sm mt-0.5">{count ?? 0} total members</p>
          </div>
          <Link
            href="/admin/users/new"
            className="cannavec-btn-primary flex items-center gap-2 text-sm !py-2 !px-4"
          >
            <UserPlus className="w-4 h-4" />
            Add user
          </Link>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-cannavec-500/30 focus:border-cannavec-500 bg-white"
            />
          </div>
          <select
            name="tier"
            defaultValue={searchParams.tier ?? ""}
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cannavec-500/30"
          >
            <option value="">All tiers</option>
            {["free", "advocacy", "startup", "professional", "enterprise"].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={searchParams.status ?? ""}
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cannavec-500/30"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="submit" className="cannavec-btn-primary text-sm !py-2 !px-4">
            Filter
          </button>
        </form>

        {/* Table */}
        <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50">
                  <th className="text-left px-4 py-3 font-medium text-warm-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-500">Tier</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-500">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-warm-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-warm-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {profiles?.map((p) => (
                  <tr key={p.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-cannavec-900">
                      <div className="flex items-center gap-2">
                        {p.full_name || "—"}
                        {p.is_admin && (
                          <span className="text-xs bg-cannavec-500 text-white px-1.5 py-0.5 rounded font-mono">
                            admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-warm-500">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_BADGE[p.role] ?? TIER_BADGE.free}`}>
                        {p.role ?? "free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-warm-400 font-mono text-xs">
                      {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {p.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminActions profile={p} currentUserId={user.id} />
                    </td>
                  </tr>
                ))}
                {!profiles?.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-warm-400">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-warm-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm bg-white hover:bg-warm-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm bg-white hover:bg-warm-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
