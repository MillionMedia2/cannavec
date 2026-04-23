"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Key, Trash2, Clock } from "lucide-react";
import { CreateKeyDialog } from "./CreateKeyDialog";
import { revokeKeyAction } from "./actions";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export function ApiKeysClient({ keys }: { keys: ApiKey[] }) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke "${name}"? Any integrations using this key will stop working.`)) return;
    setRevoking(id);
    await revokeKeyAction(id);
    setRevoking(null);
    router.refresh();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-cannavec-900">API Keys</h1>
          <p className="text-warm-500 text-sm mt-0.5">
            Generate keys to authenticate with the Cannavec API and MCP server.
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="cannavec-btn-primary flex items-center gap-2 text-sm !py-2 !px-4"
        >
          <Plus className="w-4 h-4" />
          Create new key
        </button>
      </div>

      {/* Keys table */}
      {keys.length === 0 ? (
        <div className="bg-white rounded-xl border border-warm-200 px-6 py-12 text-center">
          <div className="w-12 h-12 bg-cannavec-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-cannavec-400" />
          </div>
          <h3 className="font-medium text-cannavec-900 mb-1">No API keys yet</h3>
          <p className="text-sm text-warm-400 mb-4">
            Create your first key to start using the Cannavec API.
          </p>
          <button
            onClick={() => setShowDialog(true)}
            className="cannavec-btn-primary text-sm !py-2 !px-4 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create key
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="text-left px-4 py-3 font-medium text-warm-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-warm-500">Key prefix</th>
                <th className="text-left px-4 py-3 font-medium text-warm-500">Created</th>
                <th className="text-left px-4 py-3 font-medium text-warm-500">Last used</th>
                <th className="text-right px-4 py-3 font-medium text-warm-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-cannavec-900">{key.name}</td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs bg-warm-100 text-cannavec-700 px-2 py-1 rounded">
                      {key.key_prefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-warm-500 text-xs font-mono">
                    {formatDate(key.created_at)}
                  </td>
                  <td className="px-4 py-3 text-warm-400 text-xs">
                    {key.last_used_at ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(key.last_used_at)}
                      </span>
                    ) : (
                      <span className="text-warm-300">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRevoke(key.id, key.name)}
                      disabled={revoking === key.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-warm-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      title="Revoke key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info note */}
      <p className="text-xs text-warm-400 mt-4">
        Keys are shown only once at creation. Revoked keys are deactivated immediately — any integrations using them will stop working.
      </p>

      {showDialog && (
        <CreateKeyDialog
          onClose={() => setShowDialog(false)}
          onCreated={() => {
            // dialog stays open to show the key — it closes itself on "Done"
          }}
        />
      )}
    </>
  );
}
