import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditUserForm } from "./EditUserForm";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) redirect("/auth/login");

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !profile) redirect("/admin");

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-cannavec-900 text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 cannavec-gradient rounded-md flex items-center justify-center">
            <span className="text-white font-mono text-xs font-bold">cv</span>
          </div>
          <span className="font-display text-lg">cannavec.ai</span>
          <span className="text-white/40 text-sm">/ Admin / Edit user</span>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-cannavec-900">Edit user</h1>
          <span className="font-mono text-xs text-warm-400">{profile.id.slice(0, 8)}…</span>
        </div>

        <EditUserForm profile={profile} currentUserId={currentUser.id} />
      </main>
    </div>
  );
}
