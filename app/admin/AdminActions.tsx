"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
}

export function AdminActions({ profile, currentUserId }: { profile: Profile; currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleStatus() {
    setLoading("status");
    await fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, is_active: !profile.is_active }),
    });
    setLoading(null);
    router.refresh();
  }

  async function deleteUser() {
    if (!confirm(`Delete ${profile.email}? This cannot be undone.`)) return;
    setLoading("delete");
    await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/users/${profile.id}`}
        className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 hover:text-cannavec-600 transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={toggleStatus}
        disabled={loading === "status"}
        className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 hover:text-amber-600 transition-colors disabled:opacity-40"
        title={profile.is_active ? "Suspend" : "Reactivate"}
      >
        {profile.is_active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
      </button>
      {profile.id !== currentUserId && (
        <button
          onClick={deleteUser}
          disabled={loading === "delete"}
          className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 hover:text-red-600 transition-colors disabled:opacity-40"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
